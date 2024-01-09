export const Stack = {

    // Push an item onto the stack
    push : (items, item) => {
        items.push(item);
    },

    // Pop an item off the stack
    pop: (items) => {
        if (items.length === 0) {
            return "Stack is empty";
        }
        return items.pop();
    },

    // View the top item on the stack
    peek: (items) => {
        return items[items.length - 1];
    },

    // Check if the stack is empty
    isEmpty: (items) => {
        return items.length === 0;
    },

    // Get the size of the stack
    size: (items) => {
        return items.length;
    },

    // Clear the stack
    clear: (items) => {
        items = [];
    }
}