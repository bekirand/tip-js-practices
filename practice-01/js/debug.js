"use strict";

// Исходные строковые данные
const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Исправлено: явное приведение строк к числам для исключения конкатенации
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Исправлено: цикл должен включать 4 (taskNumber <= 4), чтобы сумма была 1..4
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
