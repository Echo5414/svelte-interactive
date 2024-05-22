// stores.ts
import { writable } from 'svelte/store';

type ContentType = 'codeBlock' | 'headline' | 'image' | 'table';

interface ContentItem {
  id: string;
  type: ContentType;
  content: string;
}

const isBrowser: boolean = typeof window !== 'undefined';

function createContentStore() {
    const initial: ContentItem[] = isBrowser ? JSON.parse(localStorage.getItem('contentItems') || '[]') : [];
    const { subscribe, update } = writable<ContentItem[]>(initial);

    const updateLocalStorage = (items: ContentItem[]) => {
        if (isBrowser) {
            localStorage.setItem('contentItems', JSON.stringify(items));
        }
    };

    return {
        subscribe,
        add: (item: ContentItem) => update(items => {
            const updated = [...items, item];
            console.log('Adding item:', item);
            updateLocalStorage(updated);
            return updated;
        }),
        update: (index: number, content: string) => update(items => {
            const updated = items.map((item, i) => i === index ? { ...item, content } : item);
            console.log(`Updating item at index ${index} with content:`, content);
            updateLocalStorage(updated);
            return updated;
        }),
        remove: (index: number) => update(items => {
            const updated = items.filter((_, i) => i !== index);
            console.log(`Removing item at index ${index}`);
            updateLocalStorage(updated);
            return updated;
        }),
        set: (value: ContentItem[]) => {
            update(_ => {
              updateLocalStorage(value);  // Ensure local storage is updated
              return value;
            });
          }
          
    };
}

export const contentStore = createContentStore();