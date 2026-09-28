import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

// Вспомогательная функция красивого вывода сводки
function printStats(label, stats) {
  console.log(`${label}: всего ${stats.total}, выполнено ${stats.completed}, осталось ${stats.pending}, прогресс ${stats.progress.toFixed(1)}%`);
}

console.log("ПР2. Демонстрационный сценарий (Вариант 3 — Белишко Кирилл Андреевич)\n");

// 1. ОБЩИЙ СЦЕНАРИЙ (demoTasks)
console.log("=== 1. Общий демонстрационный сценарий ===");
let currentDemo = demoTasks;
printStats("1.1. Исходное состояние", getTaskStats(currentDemo));

const addRes = addTask(currentDemo, 20, "Добавить проверку", "high");
if (addRes.ok) {
  currentDemo = addRes.tasks;
  printStats("1.2. Добавлена задача id=20", getTaskStats(currentDemo));
}

const completeRes = setTaskCompleted(currentDemo, 4, true);
if (completeRes.ok) {
  currentDemo = completeRes.tasks;
  printStats("1.3. Задача id=4 завершена", getTaskStats(currentDemo));
}

const renameRes = renameTask(currentDemo, 10, "Подготовить инструкцию запуска");
if (renameRes.ok) {
  currentDemo = renameRes.tasks;
  printStats("1.4. Задача id=10 переименована", getTaskStats(currentDemo));
}

const removeRes = removeTask(currentDemo, 7);
if (removeRes.ok) {
  currentDemo = removeRes.tasks;
  printStats("1.5. Задача id=7 удалена", getTaskStats(currentDemo));
}

console.log("Итоговый список названий общего набора:", getTaskTitles(currentDemo));
console.log("Подтверждение неизменности исходного demoTasks (длина 4):", demoTasks.length === 4);

// 2. ИНДИВИДУАЛЬНЫЙ СЦЕНАРИЙ (variantTasks — Вариант 3)
console.log("\n=== 2. Индивидуальный сценарий (Вариант 3: «Создание сайта-портфолио») ===");
let currentVariant = variantTasks;
printStats("2.1. Исходные задачи варианта", getTaskStats(currentVariant));

// Шаг 2: добавить id = 80 с приоритетом low
const varAdd = addTask(currentVariant, 80, "Добавить отзывы клиентов", "low");
if (varAdd.ok) {
  currentVariant = varAdd.tasks;
  printStats("2.2. Добавлена задача id=80 (low)", getTaskStats(currentVariant));
}

// Шаг 3: установить completed = true для id = 11
const varComp = setTaskCompleted(currentVariant, 11, true);
if (varComp.ok) {
  currentVariant = varComp.tasks;
  printStats("2.3. Задача id=11 подтверждена (true)", getTaskStats(currentVariant));
}

// Шаг 4: переименовать id = 23
const varRename = renameTask(currentVariant, 23, "Подготовить скриншоты лучших работ");
if (varRename.ok) {
  currentVariant = varRename.tasks;
  printStats("2.4. Задача id=23 переименована", getTaskStats(currentVariant));
}

// Шаг 5: удалить id = 37
const varRemove = removeTask(currentVariant, 37);
if (varRemove.ok) {
  currentVariant = varRemove.tasks;
  printStats("2.5. Задача id=37 удалена", getTaskStats(currentVariant));
}

// Шаг 6: попытка повторно добавить id = 80 (ожидается отказ)
const duplicateRes = addTask(currentVariant, 80, "Повторная задача 80", "low");
console.log("2.6. Повторное добавление id=80 — статус отказа:", duplicateRes.ok === false ? `Отказ: "${duplicateRes.error}"` : "Ошибка!");

// Шаг 7: подтверждение сохранения variantTasks
console.log("2.7. Подтверждение неизменности исходного variantTasks (длина 6):", variantTasks.length === 6);
printStats("Итоговое состояние варианта 3", getTaskStats(currentVariant));
console.log("Итоговые названия:", getTaskTitles(currentVariant));
