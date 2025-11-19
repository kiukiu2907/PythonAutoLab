
import { DroneState, EntityType, GridCell } from '../types';

// This interpreter uses a Transpilation approach.
// It converts the student's Python-subset code into an Async JavaScript Function.
// The JS function interacts with a "DroneAPI" object that handles animation delays.

export interface DroneAPI {
  up: () => Promise<void>;
  down: () => Promise<void>;
  left: () => Promise<void>;
  right: () => Promise<void>;
  harvest: () => Promise<void>;
  water: () => Promise<void>;
  scan: () => Promise<string>;
  log: (msg: any) => void;
  battery: number;
}

const PYTHON_KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
];

export const transpileToJs = (pythonCode: string): string => {
  const lines = pythonCode.split('\n');
  let jsCode = '(async (drone) => {\n';
  let indentStack: number[] = [0];

  // Helper for range
  jsCode += `  const range = (n) => Array.from({length: n}, (_, i) => i);\n`;

  lines.forEach((line, index) => {
    // Remove comments
    const commentIndex = line.indexOf('#');
    let cleanLine = commentIndex !== -1 ? line.substring(0, commentIndex) : line;
    
    // Determine indentation
    const trimmedLine = cleanLine.trim();
    if (!trimmedLine) return; // Skip empty lines

    const currentIndent = cleanLine.search(/\S/);
    
    // Adjust indentation (closing braces)
    while (currentIndent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsCode += '  '.repeat(indentStack.length) + '}\n';
    }

    // Process Keywords & Constructs
    let jsLine = trimmedLine;

    // drone commands -> await drone.command()
    if (jsLine.startsWith('drone.')) {
        // drone.battery is a property, not a function call
        if (!jsLine.includes('battery')) {
            jsLine = 'await ' + jsLine;
        }
    }

    // print -> drone.log
    if (jsLine.startsWith('print(')) {
        jsLine = jsLine.replace('print(', 'drone.log(');
    }

    // def function(): -> async function name() {
    if (jsLine.startsWith('def ')) {
      const funcName = jsLine.match(/def\s+(.*?)\(/)?.[1];
      jsLine = `async function ${funcName}() {`;
      indentStack.push(currentIndent + 4); // Python usually 4 spaces
    }
    // for x in range(n): -> for (let x of range(n)) {
    else if (jsLine.startsWith('for ')) {
      const rangeMatch = jsLine.match(/for\s+(.*?)\s+in\s+range\((.*?)\):/);
      const listMatch = jsLine.match(/for\s+(.*?)\s+in\s+(.*?):/);
      
      if (rangeMatch) {
        jsLine = `for (let ${rangeMatch[1]} of range(${rangeMatch[2]})) {`;
      } else if (listMatch) {
        jsLine = `for (let ${listMatch[1]} of ${listMatch[2]}) {`;
      }
      indentStack.push(currentIndent + 4);
    }
    // if condition: -> if (condition) {
    else if (jsLine.startsWith('if ')) {
      const condition = jsLine.substring(3, jsLine.length - 1); // remove 'if ' and ':'
      // Convert Python ops to JS ops basic
      let jsCondition = condition.replace(/ and /g, ' && ').replace(/ or /g, ' || ').replace(/ not /g, ' ! ');
      jsLine = `if (${jsCondition}) {`;
      indentStack.push(currentIndent + 4);
    }
    // elif condition: -> } else if (condition) {
    else if (jsLine.startsWith('elif ')) {
       // We need to close the previous block first? 
       // In this simple parser, we rely on the indentStack loop above to have closed the previous 'if' block if indent dropped.
       // BUT 'elif' is same indent as 'if', so the loop above WON'T close the 'if'. 
       // We must close the previous block manually if it's a continuation.
       // Actually, standard JS formatting:
       // if (..) {
       // } else if (..) {
       // }
       // The indentation logic above closes blocks when indent DECREASES. 
       // Since elif has SAME indent, it won't close. We need to hack it:
       // "Shift back" essentially.
       
       // For simplicity in this toy parser: We assume standard brace style.
       // We just emit `} else if (...) {`
       // The transpiler output might look like:
       // if (..) {
       //    ...
       // } else if (..) {  <-- This relies on the previous '}' NOT being emitted yet?
       // No, the indentStack logic emits '}' when indent decreases.
       // If we have:
       // if x:
       //   a
       // elif y:
       //   b
       // Indent goes: 0 -> 4 -> 0 (at elif) -> 4.
       // At 'elif', currentIndent is 0. Stack has [0, 4].
       // Loop pops 4, emits '}'. Stack is [0].
       // Now we emit 'else if'. Correct!
       
       const condition = jsLine.substring(5, jsLine.length - 1);
       let jsCondition = condition.replace(/ and /g, ' && ').replace(/ or /g, ' || ');
       jsLine = `else if (${jsCondition}) {`;
       indentStack.push(currentIndent + 4);
    }
    // else: -> } else {
    else if (jsLine.startsWith('else:')) {
       // Same logic as elif, previous block closed by indent drop.
       jsLine = `else {`;
       indentStack.push(currentIndent + 4);
    }
    // while condition: -> while (condition) {
    else if (jsLine.startsWith('while ')) {
       const condition = jsLine.substring(6, jsLine.length - 1);
       jsLine = `while (${condition}) {`;
       indentStack.push(currentIndent + 4);
    }

    jsCode += '  '.repeat(Math.max(0, indentStack.length - 1)) + jsLine + '\n';
  });

  // Close remaining blocks
  while (indentStack.length > 1) {
    indentStack.pop();
    jsCode += '  '.repeat(indentStack.length) + '}\n';
  }

  jsCode += '})';
  return jsCode;
};
