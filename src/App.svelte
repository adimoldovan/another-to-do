<script xmlns="http://www.w3.org/1999/html">
  import { format } from "date-fns";
  import { db } from "./db";
  import { liveQuery } from "dexie";
  import { onMount } from "svelte";

  let now = new Date();
  export let complete = 0;

  onMount(() => {
    const interval = setInterval(() => {
      now = new Date();
    }, 3600 * 1000);

    return () => {
      clearInterval(interval);
    };
  });

  $: openItems = liveQuery(async () => {
    let tasks = await db.tasks.where('complete').equals(complete).sortBy('priority');

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

  const drop = async (event, targetItemId, targetItemPriority, index) => {
    dropIndicator(index, false);

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
  };

  const dragstart = (event, id) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("id", id);
  };

  const dragover = (index) => {
    dropIndicator(index, true);
  };

  const dragleave = (index) => {
    dropIndicator(index, false);
  };

  const dropIndicator = (index, show) => {
    // const target = document.querySelector(`div#arrow-${index}`);
    const target = document.querySelector(`div#item-${index}`);
    if (show) {
      // target.style.display = "block";
      target.classList.add("allow-drop");
    } else {
      target.classList.remove("allow-drop");
      // target.style.display = "none";
    }
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
          console.log(`Task was updated: ${updated}`);
        } else {
          console.warn(`Task was NOT updated`);
        }
      });
    } else {
      // get max priority
      const firstItem = await db.tasks.orderBy("priority").first();

      if (firstItem) {
        currentItem.priority = firstItem.priority - 1;
      } else {
        currentItem.priority = 1;
      }

      db.tasks.add(currentItem).then(function (added) {
        if (added) {
          console.log(`Task was created: ${added}`);
        }
        else {
          console.warn("Task was NOT created");
        }
      });
    }

    closeModal();
  }

  function emptyItem() {
    return { name: "", priority: 1000, complete: 0 };
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

  async function updateItemStatus(item) {
    db.tasks.update(item.id, { 'complete': item.complete === 0 ? 1 : 0 }).then(function(updated) {
      if (updated) {
        console.log(`Item ${item.id} was updated`);
      } else {
        console.log(`Item ${item.id} was NOT updated`);
      }
    });
  }

  async function editItem(itemId) {
    console.log(`Editing item ${itemId}`);
    currentItem = await db.tasks.where("id").equals(itemId).first();
    showModal();
  }

  function showModal() {
    let modal = document.getElementById("form-container");
    modal.style.display = "block";
  }

  function closeModal() {
    let modal = document.getElementById("form-container");
    modal.style.display = "none";
    currentItem = emptyItem();
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
      <a href={'#'} class="btn action-btn add-btn" on:click={() => showModal()}>&oplus;</a>
    </div>
    {#each $openItems || [] as item, index (item.id)}
      <div
        id="item-{index}"
        class="item"
        draggable="true"
        on:dragstart={(event) => dragstart(event, item.id)}
        on:drop|preventDefault={(event) =>
          drop(event, item.id, item.priority, index)}
        ondragover="return false"
        on:dragover={() => dragover(index)}
        on:dragleave={() => dragleave(index)}
        on:dblclick={() => editItem(item.id)}
      >
        <div class="item-row">
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
            <a href={'#'} class="btn action-btn done-btn" on:click={() => updateItemStatus(item)}>&check;</a>
            <a href={'#'} class="btn action-btn delete-btn" on:click={() => deleteItem(item.id)}>&cross;</a>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <small
  ><a href={'#'} on:click={() => complete = (complete === 0 ?  1 :  0)}>show {complete === 0 ? "completed" : "open"} items</a></small
  ><br/>
  <small class="count"
    >{$noOfItems == null ? "checking..." : $noOfItems + " total items"}</small
  >

  <div id="form-container">
    <div class="modal-content">
      <span class="close" on:click={() => closeModal()}>&times;</span>
      <form on:submit|preventDefault={submitForm}>
        <textarea placeholder="buy milk" bind:value={currentItem.name} />
        <input type="hidden" bind:value={currentItem.id} />

        <a href={'#'} class="btn action-btn save-btn" on:click|preventDefault={submitForm}>&darr;</a>
      </form>
    </div>
  </div>
</main>
