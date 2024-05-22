<script lang="ts">
  import { contentStore } from '../lib/stores';
  import { onMount } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import { dndzone } from 'svelte-dnd-action';

	type ContentType = 'codeBlock' | 'headline' | 'image' | 'table';

	interface ContentItem {
    id: string;
		type: ContentType;
		content: string;
	}

  //let items = $contentStore;
  $: items = $contentStore;

  let pendingDelete: ContentItem | null = null;

	function addItem(type: ContentType): void {
		const id = uuidv4();
		let content: string;
		switch (type) {
			case 'codeBlock':
				content = '// Your code here\nconsole.log("Hello, world!");';
				break;
			case 'headline':
				content = 'Neue Überschrift';
				break;
			case 'image':
				content = 'https://example.com/image.jpg';
				break;
			case 'table':
				content = 'Initialer Tabelleninhalt';
				break;
			default:
				content = '';
		}
    console.log(`Adding item: ${content}`);
    contentStore.add({ id, type, content });
    console.log(`Item added. Current items:`, $contentStore);
	}

  function updateItem(index: number, event: Event): void {
    const target = event.target as HTMLElement;
    let newValue: string;
    if (target instanceof HTMLTextAreaElement) {
      newValue = target.value;
    } else {
      newValue = target.textContent || '';
    }
    contentStore.update(index, newValue);
  }

  onMount(() => {
    const interval = setInterval(() => {
      if (pendingDelete) {
        contentStore.remove(items.indexOf(pendingDelete));
        pendingDelete = null;
      }
    }, 100);

    return () => clearInterval(interval);
  });

  function deleteItem(index: number): void {
    contentStore.remove(index);
  }

  let contentItems = [];

function handleDndUpdate(event): void {
  const { detail } = event;
  items = detail.items;
  contentStore.set(items);
  contentItems = [...items]; // Update contentItems

  // Update contentItems array
  const draggedItem = contentItems[detail.oldIndex];
  contentItems.splice(detail.oldIndex, 1);
  contentItems.splice(detail.newIndex, 0, draggedItem);
}

</script>

<button on:click={() => addItem('codeBlock')}>+ Codeblock</button>
<button on:click={() => addItem('headline')}>+ Headline H1</button>
<button on:click={() => addItem('image')}>+ Image</button>
<button on:click={() => addItem('table')}>+ Table</button>

<div use:dndzone={{ items, flipDurationMs: 300 }} on:consider={handleDndUpdate} on:finalize={handleDndUpdate}>
  {#each items as item, i (item.id)}
    <div class="content-block">
      {#if item.type === 'codeBlock'}
        <textarea on:input={(event) => updateItem(i, event)}>{item.content}</textarea>
      {:else if item.type === 'headline'}
        <h1 contenteditable="true" on:input={(event) => updateItem(i, event)}>{item.content}</h1>
      {:else if item.type === 'image'}
        <img src={item.content} alt="Bild" />
      {:else if item.type === 'table'}
        <table contenteditable="true" on:input={(event) => updateItem(i, event)}>
          {item.content}
        </table>
      {/if}
      <button on:click={() => deleteItem(i)}>🗑️</button>
    </div>
  {/each}
</div>

<style>
	.content-block {
		background-color: #f5f5f5;
		border: 1px solid #ddd;
		padding: 10px;
		margin-bottom: 10px;
	}

	.add-button,
	.delete-button {
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
		margin-bottom: 20px;
	}

	textarea,
	h1 {
		width: 100%;
		background-color: #f5f5f5;
		border: none;
		font-family: monospace;
	}

	h1 {
		min-height: 30px;
	}

  .dropzone {
  height: 20px;
  background-color: #f0f0f0;
  border: 1px dashed #ccc;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}
</style>
