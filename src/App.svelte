<script xmlns="http://www.w3.org/1999/html">
  import { format } from "date-fns";
  import { db } from "./db";
  import { liveQuery } from "dexie";

  let now = new Date();

  let openItems = liveQuery(async () => {
    let tasks = await db.tasks.orderBy("priority").toArray();

    for (const task of tasks) {
      const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
      task.urls = task.name.match(urlRegex);
      task.name = task.name.replace(urlRegex, function (url) {
        return (
          '<a target="_blank" title= "' +
          url +
          '" href="' +
          url +
          '">' +
          getUrlHost(url) +
          "</a>"
        );
      });
    }

    return tasks;
  });

  let hovering = false;
  const drop = async (event, targetItemId, targetItemPriority) => {
    event.dataTransfer.dropEffect = "move";
    const draggedItemId = event.dataTransfer.getData("id");

    const previousItem = await db.tasks
      .where("priority")
      .below(targetItemPriority)
      .last();
    let lowerPriority = 0;

    if (previousItem) {
      lowerPriority = previousItem.priority;
    }

    // item dropped to same position, nothing to do
    if (previousItem && parseInt(targetItemId) === parseInt(draggedItemId)) {
      console.log("Same order, nothing to do");
      return;
    }

    // item dragged over the next one, nothing to do
    if (previousItem && parseInt(previousItem.id) === parseInt(draggedItemId)) {
      console.log("Same order, nothing to do");
      return;
    }

    const newPriority =
      lowerPriority + (targetItemPriority - lowerPriority) / 2;

    console.log(`${lowerPriority} | ${newPriority} | ${targetItemPriority}`);

    db.tasks
      .update(parseInt(draggedItemId), { priority: newPriority })
      .then(function (updated) {
        if (updated) console.log("Item was updated");
        else console.log("Item was not updated");
      });

    hovering = null;
  };

  const dragstart = (event, id) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("id", id);
  };

  let noOfItems = liveQuery(() => db.tasks.count());

  let currentItem = emptyItem();

  async function submitForm() {
    if (currentItem.id) {
      if (parseFloat(currentItem.priority) * 10000 === 0) {
        currentItem.priority = currentItem.id;
      }
      db.tasks.update(currentItem.id, currentItem).then(function (updated) {
        if (updated) {
          console.log(`Item ${currentItem.id} was updated`);
        } else {
          console.log(`Item ${currentItem.id} was NOT updated`);
        }
      });
    } else {
      // get max priority
      const lastItem = await db.tasks.orderBy("priority").last();

      if (lastItem) {
        currentItem.priority = lastItem.priority + 1;
      } else {
        currentItem.priority = 1;
      }

      db.tasks.add(currentItem).then(function (added) {
        if (added) console.log("Item was added");
        else console.log("Item was NOT added");
      });
    }

    closeModal();
    currentItem = emptyItem();
  }

  function emptyItem() {
    return { name: "", priority: 1000 };
  }

  function deleteItem(itemId) {
    db.tasks
      .where("id")
      .equals(itemId)
      .delete()
      .then(function (deleted) {
        if (deleted) {
          console.log(`Deleted item ${itemId}`);
        } else {
          console.log(`Item ${itemId} was NOT deleted!`);
        }
      });
  }

  async function editItem(itemId) {
    console.log(`Editing item ${itemId}`);
    currentItem = await db.tasks.where("id").equals(itemId).first();
    showModal()
  }

  function showModal() {
    let modal = document.getElementById("form-container");
    modal.style.display = "block";
  }

  function closeModal() {
    let modal = document.getElementById("form-container");
    modal.style.display = "none";
  }

  function getUrlHost(url) {
    if (url.startsWith("www")) {
      url = "https://".concat(url);
    }
    const hostname = new URL(url).hostname;
    return hostname.replace("www.", "");
  }
</script>

<main>
  <h1 class="today">
    {format(now, "EEEE")}, {format(now, "d")}
    {format(now, "MMM")}
  </h1>
  <div class="items">
    <div class="top-actions">
    <img
    class="btn action-btn add-btn"
    src="img/add.svg"
    on:click={() => showModal()}
    alt="add"
  />
    </div>
    {#each $openItems || [] as item, index (item.id)}
      <div
        class="item"
        draggable="true"
        on:dragstart={(event) => dragstart(event, item.id)}
        on:drop|preventDefault={(event) => drop(event, item.id, item.priority)}
        ondragover="return false"
        on:dragenter={() => (hovering = index)}
      >
        <div class="item-content">
          <div>{@html item.name}</div>
          <div class="task-urls">
            {#each item.urls || [] as url}
              <a target="_blank" title={url} class="task-url" href={url}
                >{getUrlHost(url)}</a
              >
            {/each}
          </div>
        </div>
        <div class="item-actions">
          <img
            class="btn action-btn edit-btn"
            src="img/edit.svg"
            on:click={() => editItem(item.id)}
            alt="edit"
          />
          <img
            class="btn action-btn delete-btn"
            src="img/close.svg"
            on:click={() => deleteItem(item.id)}
            alt="delete"
          />
        </div>
      </div>
    {/each}
  </div>
  <small class="count"
  >{$noOfItems == null ? "checking..." : $noOfItems + " items"}</small
  >
  <div id="form-container">
    <div class="modal-content">
      <span class="close" on:click={() => closeModal()}>&times;</span>
      <form on:submit|preventDefault={submitForm}>
        <textarea placeholder="buy milk" bind:value={currentItem.name} />
        <input type="hidden" bind:value={currentItem.id} />
        <img
          class="btn action-btn save-btn"
          src="img/right-arrow.svg"
          on:click|preventDefault={submitForm}
          alt="add"
        />
      </form>
    </div>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  h1.today {
    margin-top: 0;
    text-align: left;
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2.5rem;
    font-weight: 100;
  }

  .count {
    text-align: left;
  }

  div.items {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 2vh;
  }

  div.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px;
    background-color: var(--bg-color-secondary);
    border-radius: 6px;
    border: none;
    padding: 15px;
    white-space: pre-line;
    text-align: left;
  }

  #form-container {
      display: none;
      position: fixed;
      z-index: 1;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: var(--bg-color);
  }

  .modal-content {
      padding: 20px;
      margin: auto;
      width: 80%;
      height: 80%
  }

  .close {
      color: var(--fg-color);
      float: right;
      font-size: 28px;
      font-weight: bold;
  }

  .close:hover,
  .close:focus {
      cursor: pointer;
  }

  form {
    display: flex;
    justify-content: center;
    flex-flow: row;
    align-items: center;
    margin-top: 10px;
    width: 100%;
    height: 100%;
  }

  textarea {
    padding: 20px 70px 20px 20px;
    width: 70%;
    height: 70%;
    background: var(--bg-color-secondary);
    border: none;
    border-radius: 3px;
    box-sizing: border-box;
    color: var(--fg-color);
    outline: none;
  }

  .item-content {
    display: inline-grid;
  }

  .item-actions {
    display: inline-grid;
  }

  .top-actions {
      text-align: right;
      padding-right: 24px;
  }

  .btn {
    padding: 5px;
    border-radius: 5px;
    border: none;
    color: #acbac7;
    background-color: transparent;
    background-size: 100% 100%;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    filter: invert(87%) sepia(10%) saturate(366%) hue-rotate(167deg)
      brightness(84%) contrast(90%);
  }

  .add-btn:hover {
      filter: invert(52%) sepia(11%) saturate(1628%) hue-rotate(46deg)
      brightness(102%) contrast(87%);
  }

  .save-btn {
    width: 48px;
    height: 48px;
    margin-left: 10px;
    filter: invert(52%) sepia(11%) saturate(1628%) hue-rotate(46deg)
      brightness(102%) contrast(87%);
  }

  .edit-btn:hover {
    filter: invert(82%) sepia(52%) saturate(329%) hue-rotate(7deg)
      brightness(97%) contrast(89%);
  }

  .delete-btn:hover {
    filter: invert(35%) sepia(60%) saturate(5270%) hue-rotate(0deg)
      brightness(100%) contrast(108%);
  }

  .task-urls {
    padding: 15px;
  }

  a.task-url {
    display: inline-grid;
    padding: 10px;
    margin-right: 10px;
    background-color: var(--bg-color);
    border-radius: 10px;
  }

  a.task-url:hover {
    text-decoration: none;
    background-color: var(--fg-color);
  }
</style>
