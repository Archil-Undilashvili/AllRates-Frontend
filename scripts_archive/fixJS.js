const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const badBlock = `                let mainName = compNameKa;
                let subName = '';
                const matchObj = compNameKa.match(/^(.*?)\\s*\\((.*?)\\)$/);
                if (matchObj) {
                    mainName = matchObj[1];
                    subName = matchObj[2]; // ფრჩხილების გარეშე ვიღებთ შიგთავსს
                }

                let mainName = compNameKa;
                let subName = '';
                const matchObj = compNameKa.match(/^(.*?)\\s*\\((.*?)\\)$/);
                if (matchObj) {
                    mainName = matchObj[1];
                    subName = matchObj[2]; // ფრჩხილების გარეშე ვიღებთ შიგთავსს
                }`;

const goodBlock = `                let mainName = compNameKa;
                let subName = '';
                const matchObj = compNameKa.match(/^(.*?)\\s*\\((.*?)\\)$/);
                if (matchObj) {
                    mainName = matchObj[1];
                    subName = matchObj[2]; // ფრჩხილების გარეშე ვიღებთ შიგთავსს
                }`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
console.log("Fixed redeclaration error");