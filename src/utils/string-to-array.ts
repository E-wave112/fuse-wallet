// simple function to transform a json string to an array of objects
export const stringToArray = (json: string): any[] => {
    return JSON.parse(json);
};

// transform an array of objects to a json string
export const arrayToString = (array: any[]): string => {
    return JSON.stringify(array);
};
