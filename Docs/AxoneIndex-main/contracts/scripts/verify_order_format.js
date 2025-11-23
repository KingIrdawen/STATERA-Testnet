// Vérification du format des ordres

console.log("Vérification du format des ordres:\n");

// Exemple: vendre 0.53735606 HYPE
const hypeToSell = 0.53735606;
const szDecimals = 2;
const weiDecimals = 8;

console.log("📊 Tailles en différents formats:");
console.log(`   Montant à vendre: ${hypeToSell} HYPE`);
console.log(`   szDecimals: ${szDecimals}`);
console.log(`   weiDecimals: ${weiDecimals}`);

// 1. En szDecimals (format de toSzInSzDecimals)
const sizeSz = Math.floor(hypeToSell * (10 ** szDecimals));
console.log(`\n1. En szDecimals (format de toSzInSzDecimals):`);
console.log(`   ${sizeSz} (représente ${hypeToSell.toFixed(szDecimals)} HYPE)`);

// 2. Conversion vers format 1e8 (via sizeSzTo1e8)
// sizeSzTo1e8(szDecimals=2): si szDecimals < 8, multiplie par 10^(8-2) = 10^6
const size1e8 = sizeSz * (10 ** (8 - szDecimals));
console.log(`\n2. En format 1e8 (après sizeSzTo1e8):`);
console.log(`   ${size1e8} (représente ${(size1e8 / 1e8).toFixed(8)} HYPE)`);

// 3. Dans Lib_EVM, les ordres utilisent format 1e8
// Test montre: uint64 baseAmt = 1e8; // 1 HYPE
console.log(`\n3. Format attendu par HyperCore (selon Lib_EVM):`);
console.log(`   Format 1e8 (taille humaine * 1e8)`);
console.log(`   Exemple Lib_EVM: 1e8 = 1 HYPE`);

// 4. Dans CoreExecution, la taille est convertie en weiDecimals pour la vérification de balance
// scale(action.sz, 8, baseToken.weiDecimals)
// Si action.sz = 53735606 (1e8) et weiDecimals = 8, alors scale(53735606, 8, 8) = 53735606
// Mais en pratique, CoreExecution utilise scale pour convertir de format 1e8 vers weiDecimals
console.log(`\n4. Conversion dans CoreExecution pour vérification balance:`);
console.log(`   action.sz (format 1e8) = ${size1e8}`);
console.log(`   Conversion via scale(action.sz, 8, weiDecimals)`);
console.log(`   Si weiDecimals = 8: scale(${size1e8}, 8, 8) = ${size1e8}`);
console.log(`   Balance en weiDecimals doit être >= ${size1e8}`);

// 5. Vérification de la cohérence
const balanceSz = 56715000; // Balance observée en szDecimals (supposé)
const balanceInHype = balanceSz / (10 ** szDecimals);
console.log(`\n5. Vérification de cohérence:`);
console.log(`   Balance observée: ${balanceSz} (en szDecimals)`);
console.log(`   Balance en HYPE: ${balanceInHype.toFixed(szDecimals)} HYPE`);
console.log(`   Taille à vendre: ${hypeToSell} HYPE`);
console.log(`   Disponible: ${balanceInHype >= hypeToSell ? '✅ OUI' : '❌ NON'}`);

// 6. Si balance était en weiDecimals
const balanceWei = 56715000; // Si c'était en weiDecimals
const balanceInHypeWei = balanceWei / (10 ** weiDecimals);
console.log(`\n6. Si balance était en weiDecimals:`);
console.log(`   Balance: ${balanceWei} (en weiDecimals)`);
console.log(`   Balance en HYPE: ${balanceInHypeWei.toFixed(weiDecimals)} HYPE`);
console.log(`   Conversion en szDecimals: ${Math.floor(balanceWei / (10 ** (weiDecimals - szDecimals)))}`);

console.log(`\n✅ Conclusion:`);
console.log(`   - Les ordres sont passés en format 1e8 (taille humaine * 1e8)`);
console.log(`   - toSzInSzDecimals calcule en szDecimals`);
console.log(`   - sizeSzTo1e8 convertit de szDecimals vers format 1e8`);
console.log(`   - C'est cohérent avec Lib_EVM`);



