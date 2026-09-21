"use strict";

// Входные строковые данные (Вариант 3)
const totalTasksInput = " 9 ";
const completedTasksInput = "9";

// Валидация и парсинг строковых параметров
function validateAndParse(input, fieldName) {
  if (typeof input !== "string") {
    return { ok: false, error: `${fieldName} должен быть строкой` };
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return { ok: false, error: `${fieldName} не должен быть пустой строкой` };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num)) {
    return { ok: false, error: `${fieldName} содержит недопустимое число (NaN или Infinity)` };
  }
  if (!Number.isInteger(num)) {
    return { ok: false, error: `${fieldName} должен быть целым числом` };
  }
  return { ok: true, value: num };
}

const totalParsed = validateAndParse(totalTasksInput, "totalTasks");
const completedParsed = validateAndParse(completedTasksInput, "completedTasks");

if (!totalParsed.ok) {
  console.log(`Ошибка: ${totalParsed.error}`);
} else if (!completedParsed.ok) {
  console.log(`Ошибка: ${completedParsed.error}`);
} else {
  const totalTasks = totalParsed.value;
  const completedTasks = completedParsed.value;

  if (totalTasks < 0 || totalTasks > 1000) {
    console.log("Ошибка: общее количество задач должно быть в диапазоне от 0 до 1000");
  } else if (completedTasks < 0) {
    console.log("Ошибка: количество выполненных задач не может быть отрицательным");
  } else if (completedTasks > totalTasks) {
    console.log("Ошибка: количество выполненных задач не может превышать общее количество задач");
  } else if (totalTasks === 0 && completedTasks === 0) {
    console.log("Задач пока нет");
  } else {
    const remainingTasks = totalTasks - completedTasks;
    const progressPercent = (completedTasks / totalTasks) * 100;

    let status = "В работе";
    if (completedTasks === 0) {
      status = "Не начато";
    } else if (completedTasks === totalTasks) {
      status = "Завершено";
    }

    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${remainingTasks}`);
    console.log(`Прогресс: ${progressPercent.toFixed(1)}%`);
    console.log(`Статус: ${status}`);
  }
}
