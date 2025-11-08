import { db } from '../db.js';

export function setupDragHandlers(element, task, index, onUpdate) {
  element.setAttribute('draggable', 'true');
  element.setAttribute('role', 'listitem');

  element.addEventListener('dragstart', (event) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('id', task.id);
  });

  element.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropIndicator(index, false);

    event.dataTransfer.dropEffect = 'move';
    const draggedItemId = parseInt(event.dataTransfer.getData('id'));

    const previousItem = await db.tasks
      .where('priority')
      .below(task.priority)
      .last();

    let lowerPriority = 0;
    if (previousItem) {
      lowerPriority = previousItem.priority;
    }

    // Item dropped to same position
    if (task.id === draggedItemId) {
      console.log('Same order, nothing to do');
      return;
    }

    // Item dragged over the next one
    if (previousItem && previousItem.id === draggedItemId) {
      console.log('Same order, nothing to do');
      return;
    }

    const newPriority = lowerPriority + (task.priority - lowerPriority) / 2;
    console.log(`${lowerPriority} | ${newPriority} | ${task.priority}`);

    await db.tasks.update(draggedItemId, { priority: newPriority });
    if (onUpdate) onUpdate();
  });

  element.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropIndicator(index, true);
  });

  element.addEventListener('dragleave', () => {
    dropIndicator(index, false);
  });
}

function dropIndicator(index, show) {
  const target = document.querySelector(`div#item-${index}`);
  if (target) {
    if (show) {
      target.classList.add('allow-drop');
    } else {
      target.classList.remove('allow-drop');
    }
  }
}
