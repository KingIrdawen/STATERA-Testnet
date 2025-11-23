// Test de la formule de calcul de taille

// Si on veut vendre 0.53735606 HYPE pour 25.5 USD à 47.5 USD/HYPE
const hypeToSell = 0.53735606;
const targetUsd = 25.5;
const priceUsd = 47.5;

console.log("Test de la formule:");
console.log(`HYPE à vendre: ${hypeToSell} HYPE`);
console.log(`Target USD: ${targetUsd} USD`);
console.log(`Price: ${priceUsd} USD/HYPE`);

// En szDecimals (szDecimals=2):
const szDecimals = 2;
const sizeInSzDecimals = Math.floor(hypeToSell * (10 ** szDecimals));
console.log(`\nEn szDecimals (szDecimals=${szDecimals}): ${sizeInSzDecimals}`);

// Formule actuelle dans toSzInSzDecimals:
// numerator = absUsd * 10^szDecimals
// denom = price1e8 * 1e10
// s = numerator / denom

const absUsd1e18 = BigInt(Math.floor(targetUsd * 1e18));
const price1e8 = BigInt(Math.floor(priceUsd * 1e8));

const numerator = absUsd1e18 * (10n ** BigInt(szDecimals));
const denom = price1e8 * BigInt(1e10);
const s = numerator / denom;

console.log(`\nFormule actuelle:`);
console.log(`  absUsd1e18: ${absUsd1e18.toString()}`);
console.log(`  price1e8: ${price1e8.toString()}`);
console.log(`  numerator: ${numerator.toString()}`);
console.log(`  denom: ${denom.toString()}`);
console.log(`  s: ${s.toString()} (en szDecimals)`);
console.log(`  s en HYPE: ${(Number(s) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

// Test avec les valeurs réelles du rebalance
// Delta USD: -2552492356500000000000000 (environ -25524.923565 USD)
const realDeltaUsd1e18 = BigInt("2552492356500000000000000");
const realPrice1e8 = BigInt("4750095000"); // Prix de vente (bid)

const realNumerator = realDeltaUsd1e18 * (10n ** BigInt(szDecimals));
const realDenom = realPrice1e8 * BigInt(1e10);
const realS = realNumerator / realDenom;

console.log(`\nAvec les valeurs réelles du rebalance:`);
console.log(`  Delta USD: ${(Number(realDeltaUsd1e18) / 1e18).toFixed(6)} USD`);
console.log(`  Price: ${(Number(realPrice1e8) / 1e8).toFixed(6)} USD`);
console.log(`  numerator: ${realNumerator.toString()}`);
console.log(`  denom: ${realDenom.toString()}`);
console.log(`  s (formule actuelle): ${realS.toString()} (en szDecimals)`);
console.log(`  s en HYPE: ${(Number(realS) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

// Formule correcte selon la documentation:
// tailleBase(szDecimals) = (USD1e18 / px1e8) * 10^(szDecimals-8)
// Si szDecimals < 8, alors 10^(szDecimals-8) est négatif, donc on divise
// = (USD1e18 / px1e8) / 10^(8-szDecimals)
// = USD1e18 / (px1e8 * 10^(8-szDecimals))

const correctDenom = realPrice1e8 * (10n ** BigInt(8 - szDecimals));
const correctS = realDeltaUsd1e18 / correctDenom;

console.log(`\nFormule correcte (selon doc):`);
console.log(`  correctDenom: ${correctDenom.toString()}`);
console.log(`  correctS: ${correctS.toString()} (en szDecimals)`);
console.log(`  correctS en HYPE: ${(Number(correctS) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

console.log(`\nDifférence:`);
console.log(`  Formule actuelle: ${realS.toString()} = ${(Number(realS) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);
console.log(`  Formule correcte: ${correctS.toString()} = ${(Number(correctS) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);
console.log(`  Facteur d'erreur: ${Number(realS) / Number(correctS)}`);

console.log(`\nFormule correcte:`);
console.log(`  correctNumerator: ${correctNumerator.toString()}`);
console.log(`  correctS: ${correctS.toString()} (en szDecimals)`);
console.log(`  correctS en HYPE: ${(Number(correctS) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

console.log(`\nDifférence:`);
console.log(`  Formule actuelle: ${s.toString()}`);
console.log(`  Formule correcte: ${correctS.toString()}`);
console.log(`  Facteur: ${Number(s) / Number(correctS)}`);

