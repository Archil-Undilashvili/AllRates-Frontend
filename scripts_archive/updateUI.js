const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const oldHTML = `                tr.innerHTML = \`
                    <td class="company-name">
                        <a href="\${compUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                            <div class="company-logo-wrapper" title="\${compNameKa}">
                                \${logoUrl ? \`<img src="\${logoUrl}" alt="\${compNameKa}" class="\${logoClass}">\` : \`<span>\${compNameKa}</span>\`}
                            </div>
                        </a>
                    </td>
                    <td class="buy">\${buyDisplay}</td>
                    <td class="sell">\${sellDisplay}</td>
                    <td class="spread">\${spreadDisplay}</td>
                \`;`;

const newHTML = `                let mainName = compNameKa;
                let subName = '';
                const matchObj = compNameKa.match(/^(.*?)\\s*\\((.*?)\\)$/);
                if (matchObj) {
                    mainName = matchObj[1];
                    subName = matchObj[2]; // ფრჩხილების გარეშე ვიღებთ შიგთავსს
                }

                tr.innerHTML = \`
                    <td class="company-name">
                        <a href="\${compUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: block;">
                            <div style="display: flex; align-items: center; gap: 12px; padding: 4px 0;">
                                \${logoUrl ? \`<div style="width: 36px; height: 36px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;"><img src="\${logoUrl}" alt="\${compNameKa}" class="\${logoClass}" style="max-width: 75%; max-height: 75%; object-fit: contain;"></div>\` : \`<div style="width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><span style="font-weight:bold; color:#64748b;">\${mainName.charAt(0)}</span></div>\`}
                                <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.2;">
                                    <span style="font-weight: 600; color: #1e293b; font-size: 14px; white-space: nowrap;">\${mainName}</span>
                                    \${subName ? \`<span style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px;">\${subName}</span>\` : ''}
                                </div>
                            </div>
                        </a>
                    </td>
                    <td class="buy">\${buyDisplay}</td>
                    <td class="sell">\${sellDisplay}</td>
                    <td class="spread">\${spreadDisplay}</td>
                \`;`;

if (code.includes(oldHTML)) {
    code = code.replace(oldHTML, newHTML);
    fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
    console.log("Success");
} else {
    console.log("Old block not found. Trying regex or manual review.");
}