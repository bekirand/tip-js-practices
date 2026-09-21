"use strict";

// Входные данные по варианту 3 (студент 3 в списке группы)
const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;

// Проверка входных данных
if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть в диапазоне от 0 до 1000");
} else if (completedTasks < 0) {
  console.log("Ошибка: количество выполненных задач не может быть отрицательным");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: количество выполненных задач не может превышать общее количество задач");
} else if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000");
} else {
  let remaining = totalTasks - completedTasks;
  console.log(`Осталось задач: ${remaining}`);

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
  } else {
    let day = 0;
    while (remaining > 0) {
      day += 1;
      const tasksToday = Math.min(dailyLimit, remaining);
      remaining -= tasksToday;
      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remaining}`);
    }
    console.log(`Потребуется дней: ${day}`);
  }
}
