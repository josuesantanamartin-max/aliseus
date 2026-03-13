import { get, set } from 'idb-keyval';
import { syncService } from './syncService';

const QUEUE_KEY = 'aliseus_offline_queue';

export interface QueuedOperation {
    id: string; // Unique ID for the operation to prevent duplicates or allow deduplication
    type: string; // Action type, e.g., 'saveTransaction', 'deleteRecipe'
    payload: any; // The payload to send to the syncService method
    timestamp: number;
}

/**
 * Service to manage a persistent offline queue of backend mutations using IndexedDB.
 * Ensures mutations are not lost if the app closes while offline.
 */
class OfflineQueueService {
    private isProcessing = false;

    /**
     * Gets the current queue from IndexedDB.
     */
    async getQueue(): Promise<QueuedOperation[]> {
        const queue = await get<QueuedOperation[]>(QUEUE_KEY);
        return queue || [];
    }

    /**
     * Saves the queue back to IndexedDB.
     */
    private async saveQueue(queue: QueuedOperation[]): Promise<void> {
        await set(QUEUE_KEY, queue);
    }

    /**
     * Enqueues a new operation. Call this when a syncService map fails.
     */
    async enqueue(type: keyof typeof syncService, payload: any): Promise<void> {
        const queue = await this.getQueue();

        // Push the new operation
        const operation: QueuedOperation = {
            id: crypto.randomUUID(), // Assume modern browser
            type,
            payload,
            timestamp: Date.now()
        };

        queue.push(operation);
        await this.saveQueue(queue);
        console.log(`[OfflineQueueService] Enqueued operation ${type}. Queue size: ${queue.length}`);
    }

    /**
     * Processes the queue sequentially. Resolves when queue is empty or stops on first failure.
     */
    async processQueue(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const queue = await this.getQueue();
            if (queue.length === 0) {
                this.isProcessing = false;
                return;
            }

            console.log(`[OfflineQueueService] Processing queue of size ${queue.length}...`);

            const remainingQueue = [...queue];

            while (remainingQueue.length > 0) {
                const operation = remainingQueue[0];
                try {
                    // Dynamically invoke the correct syncService method
                    const method = (syncService as any)[operation.type];
                    if (typeof method === 'function') {
                        // Most syncService methods take 1 argument, but apply handles arrays
                        const args = Array.isArray(operation.payload)
                            ? operation.payload // If the sync method expected an array, this might need special handling based on the exact method signature. Usually we pass the object.
                            : [operation.payload];

                        // Handle the case where the payload itself is an array but meant to be passed as a single argument (e.g. saveWeeklyPlan)
                        if (['saveWeeklyPlan', 'saveAccountsOrder'].includes(operation.type)) {
                            await method.call(syncService, operation.payload);
                        } else {
                            // Single entity save/delete
                            await method.call(syncService, ...args);
                        }

                        console.log(`[OfflineQueueService] Successfully processed ${operation.type}`);
                        remainingQueue.shift(); // Remove from queue on success
                        await this.saveQueue(remainingQueue); // Save progress
                    } else {
                        console.error(`[OfflineQueueService] Unknown syncService method: ${operation.type}. Discarding operation.`);
                        remainingQueue.shift();
                        await this.saveQueue(remainingQueue);
                    }
                } catch (error) {
                    // If network fails again, break and leave remaining items in queue
                    console.error(`[OfflineQueueService] Failed to process ${operation.type}. Stopping queue.`, error);
                    break;
                }
            }

            if (remainingQueue.length === 0) {
                console.log(`[OfflineQueueService] Queue processed successfully.`);
            }

        } finally {
            this.isProcessing = false;
        }
    }
}

export const offlineQueueService = new OfflineQueueService();
