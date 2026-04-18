const fs = require('fs');

let code = fs.readFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', 'utf8');

const oldLogos = `const LOGOS = {
            'rico': 'Logos/rico.png',
            'valuto': 'https://valuto.ge/uploads/2021/03/%E1%83%95%E1%83%90%E1%83%9A%E1%83%A3%E1%83%A2%E1%83%9D-%E1%83%9A%E1%83%9D%E1%83%92%E1%83%9D.png',
            'kursige': 'Logos/kursige.png',
            'crystal': 'Logos/crystal.png',
            'bog': 'Logos/bog.png',
            'tbc': 'https://tbcbank.ge/assets/tbc-ge/favicon.png',
            'liberty': 'Logos/Liberty.png',
            'bb': 'Logos/BB.png',
            'credo': 'Logos/credo.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/Giro.png',
            'goa': 'Logos/Goa.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc.png',
            'tera': 'Logos/TERA.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/IS.png',
            'silk': 'Logos/silk.png',
            'paysera': 'Logos/PAYSERA.png'
        };`;

const newLogos = `const LOGOS = {
            'rico': 'Logos/rico.png',
            'valuto': 'https://valuto.ge/uploads/2021/03/%E1%83%95%E1%83%90%E1%83%9A%E1%83%A3%E1%83%A2%E1%83%9D-%E1%83%9A%E1%83%9D%E1%83%92%E1%83%9D.png',
            'kursige': 'Logos/kursige.png',
            'crystal': 'Logos/crystal.png',
            'bog': 'Logos/bog.png',
            'tbc': 'https://tbcbank.ge/assets/tbc-ge/favicon.png',
            'liberty': 'Logos/Liberty.png',
            'bb': 'Logos/bb.png',
            'credo': 'Logos/credo.png',
            'cartu': 'Logos/cartu.png',
            'inex': 'Logos/Inex.png',
            'giro': 'Logos/Giro.png',
            'goa': 'Logos/Goa.png',
            'hash': 'Logos/Hash.png',
            'mbc': 'Logos/mbc.png',
            'tera': 'Logos/TERA.png',
            'halyk': 'Logos/HALYK.png',
            'is': 'Logos/IS.png',
            'silk': 'Logos/slik.png',
            'paysera': 'Logos/PAYSERA.png'
        };`;

if(code.includes(oldLogos)) {
    code = code.replace(oldLogos, newLogos);
    fs.writeFileSync('/Users/archilundilashvili/Desktop/AllRates.ge/js/main.js', code);
    console.log("Logos fixed");
} else {
    console.log("Could not find LOGOS definition");
}