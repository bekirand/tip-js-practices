"use strict";

// Входные данные по варианту 3 (студент 3 в списке группы)
const totalTasks = 9;
const completedTasks = 9;

// Проверка корректности типов и диапазона значений
if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом");
} else if (totalTasks < 0 || totalTasks > 1000) {
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
