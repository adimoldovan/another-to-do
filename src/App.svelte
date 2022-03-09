<script xmlns="http://www.w3.org/1999/html">
  import {format} from "date-fns";
  import {db} from "./db";
  import {liveQuery} from "dexie";

  let now = new Date();

  let openItems = liveQuery(async () => {
    let tasks = await db.tasks.orderBy('priority').toArray();

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
    event.dataTransfer.dropEffect = 'move'
    const draggedItemId = event.dataTransfer.getData("id")
    const draggedItemPriority = event.dataTransfer.getData("priority")

    console.log(`id: ${draggedItemId}, prio: ${draggedItemPriority}`)
    console.log(`id: ${targetItemId}, prio: ${targetItemPriority}`)

    const previousItem = await db.tasks.where('priority').below(targetItemPriority).last();

    // item dropped to same position, nothing to do
    if(parseInt(targetItemId) === parseInt(draggedItemId)) {
      console.log('same order, nothing to do')
      return;
    }

    // item dragged over the next one, nothing to do
    if(parseInt(previousItem.id) === parseInt(draggedItemId)) {
      console.log('same order, nothing to do')
      return;
    }

    const newPriority = previousItem.priority + (targetItemPriority - previousItem.priority)/2

    console.log(`${previousItem.priority} | ${newPriority} | ${targetItemPriority}`)

    db.tasks.update(parseInt(draggedItemId), {priority: newPriority}).then(function (updated) {
      if (updated)
        console.log ("Item was updated");
      else
        console.log ("Item was not updated");
    });

    hovering = null
  }

  const dragstart = (event, id, priority) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData("id", id);
    event.dataTransfer.setData("priority", priority);
  }

  let noOfItems = liveQuery(() => db.tasks.count());

  let currentItem = emptyItem();

  function submitForm() {
    console.log("form submit");
    if (currentItem.id) {
      console.log(`update item ${currentItem.id}`);
      if(currentItem.priority === 0) {
        currentItem.priority = currentItem.id
      }
      db.tasks.update(currentItem.id, currentItem);
    } else {
      console.log("add new item");
      db.tasks.add(currentItem);
    }

    currentItem = emptyItem();
  }

  function emptyItem() {
    return { name: "", priority: 0 };
  }

  function deleteItem(itemId) {
    console.log(`deleting item ${itemId}`);
    db.tasks.where("id").equals(itemId).delete();
  }

  async function editItem(itemId) {
    console.log(`editing item ${itemId}`);
    currentItem = await db.tasks.where("id").equals(itemId).first();
    console.log(currentItem);
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
    <small class="count"
      >{$noOfItems == null ? "checking..." : $noOfItems + " items"}</small
    >
    {#each $openItems || [] as item, index (item.id)}
      <div class="item"
           draggable=true
           on:dragstart={event => dragstart(event, item.id, item.priority)}
           on:drop|preventDefault={event => drop(event, item.id, item.priority)}
           ondragover="return false"
           on:dragenter={() => hovering = index}
      >
        <div>
          <div>{@html item.name}</div>
          <div class="task-urls">
            {#each item.urls || [] as url}
              <a target="_blank" title={url} class="task-url" href={url}
                >{getUrlHost(url)}</a
              >
            {/each}
          </div>
        </div>
        <div>
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
  <form on:submit|preventDefault={submitForm}>
    <textarea placeholder="buy milk" bind:value={currentItem.name}></textarea>
    <input type="hidden" bind:value={currentItem.id} />
    <img
      class="btn action-btn add-btn"
      src="img/right-arrow.svg"
      on:click|preventDefault={submitForm}
      alt="add"
    />
  </form>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
    /*background-color: var(--bg-color-secondary)*/
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

  form {
    display: flex;
    justify-content: center;
    flex-flow: row;
    align-items: center;
    margin-top: 10px;
    width: 100%;
  }

  textarea {
    /*margin: 0 0 10px 0;*/
    padding: 20px 70px 20px 20px;
    width: 70%;
    height: 70px;
    background: var(--bg-color-secondary);
    border: none;
    border-radius: 3px;
    box-sizing: border-box;
    color: var(--fg-color);
    /*font-size: $item-font-size;*/
    outline: none;
  }

  .btn {
    padding: 5px;
    border-radius: 5px;
    border: none;
    color: #acbac7;
    /*background-color: #22272d;*/
    background-color: transparent;
    background-size: 100% 100%;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    filter: invert(87%) sepia(10%) saturate(366%) hue-rotate(167deg)
      brightness(84%) contrast(90%);
  }

  .add-btn {
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
    padding: 5px;
    margin-right: 10px;
  }
</style>
