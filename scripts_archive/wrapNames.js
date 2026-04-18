const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const oldHTML = `                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="\${mainName}">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;" title="\${subName}">\${subName}</span>\` : ''}
                                </div>`;

const newHTML = `                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.25; max-width: 160px;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 13px; white-space: normal; word-break: break-word;">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 3px; white-space: normal; word-break: break-word;">\${subName}</span>\` : ''}
                                </div>`;

code = code.replace(oldHTML, newHTML);
fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
console.log("Updated to multiline wrap");