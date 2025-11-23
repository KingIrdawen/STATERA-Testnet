// Vérification de la formule correcte

// Formule dans la doc:
// tailleBase(szDecimals) = (USD1e18 / px1e8) * 10^(szDecimals-8)

// Exemple: vendre 0.53735606 HYPE pour 25.5 USD à 47.5 USD/HYPE
const hypeToSell = 0.53735606;
const targetUsd = 25.5;
const priceUsd = 47.5;
const szDecimals = 2;

console.log("Test de la formule:");
console.log(`HYPE à vendre: ${hypeToSell} HYPE`);
console.log(`Target USD: ${targetUsd} USD`);
console.log(`Price: ${priceUsd} USD/HYPE`);
console.log(`szDecimals: ${szDecimals}`);

// En szDecimals:
const sizeInSzDecimals = Math.floor(hypeToSell * (10 ** szDecimals));
console.log(`\nEn szDecimals: ${sizeInSzDecimals}`);

// Formule de la doc:
// tailleBase = (USD1e18 / px1e8) * 10^(szDecimals-8)
// Si szDecimals=2, alors 10^(2-8) = 10^(-6)
// Donc: tailleBase = (USD1e18 / px1e8) / 10^6

const usd1e18 = BigInt(Math.floor(targetUsd * 1e18));
const px1e8 = BigInt(Math.floor(priceUsd * 1e8));

// Formule de la doc (version développée):
// numerator = USD1e18 * 10^szDecimals
// denom = px1e8 * 1e10
// tailleBase = numerator / denom

const numerator = usd1e18 * (10n ** BigInt(szDecimals));
const denom = px1e8 * BigInt(1e10);
const tailleBase = numerator / denom;

console.log(`\nFormule de la doc:`);
console.log(`  numerator = ${usd1e18.toString()} * 10^${szDecimals} = ${numerator.toString()}`);
console.log(`  denom = ${px1e8.toString()} * 1e10 = ${denom.toString()}`);
console.log(`  tailleBase = ${tailleBase.toString()} (en szDecimals)`);
console.log(`  tailleBase en HYPE: ${(Number(tailleBase) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

// Vérification: est-ce que ça correspond à sizeInSzDecimals ?
console.log(`\nVérification:`);
console.log(`  Attendu: ${sizeInSzDecimals} (en szDecimals)`);
console.log(`  Calculé: ${tailleBase.toString()} (en szDecimals)`);
console.log(`  Correspond: ${Number(tailleBase) === sizeInSzDecimals ? '✅ OUI' : '❌ NON'}`);

// Maintenant avec les valeurs réelles du rebalance
const realDeltaUsd1e18 = BigInt("2552492356500000000000000");
const realPrice1e8 = BigInt("4750095000");

const realNumerator = realDeltaUsd1e18 * (10n ** BigInt(szDecimals));
const realDenom = realPrice1e8 * BigInt(1e10);
const realTailleBase = realNumerator / realDenom;

console.log(`\nAvec les valeurs réelles du rebalance:`);
console.log(`  Delta USD: ${(Number(realDeltaUsd1e18) / 1e18).toFixed(6)} USD`);
console.log(`  Price: ${(Number(realPrice1e8) / 1e8).toFixed(6)} USD`);
console.log(`  Taille calculée: ${realTailleBase.toString()} (en szDecimals)`);
console.log(`  Taille en HYPE: ${(Number(realTailleBase) / (10 ** szDecimals)).toFixed(szDecimals)} HYPE`);

// Le problème: si la balance est 56715000 en szDecimals, cela signifie 567150.00 HYPE
// Mais l'utilisateur dit qu'il n'y a que 0.57 HYPE
// Donc peut-être que la balance est en weiDecimals ?

const balanceWei = 56715000;
const weiDecimals = 8;
const balanceInHype = balanceWei / (10 ** weiDecimals);
console.log(`\nSi la balance est en weiDecimals:`);
console.log(`  Balance: ${balanceWei} (weiDecimals)`);
console.log(`  En HYPE: ${balanceInHype.toFixed(weiDecimals)} HYPE`);

// Si la balance est en weiDecimals, il faut la convertir en szDecimals pour comparer
const balanceInSzDecimals = Math.floor(balanceWei / (10 ** (weiDecimals - szDecimals)));
console.log(`  Balance en szDecimals: ${balanceInSzDecimals}`);

console.log(`\nComparaison:`);
console.log(`  Taille calculée: ${realTailleBase.toString()} (en szDecimals)`);
console.log(`  Balance disponible: ${balanceInSzDecimals} (en szDecimals, si balance était en weiDecimals)`);
console.log(`  Différence: ${Number(realTailleBase) - balanceInSzDecimals}`);



