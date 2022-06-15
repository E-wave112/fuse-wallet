const arr = [];
const arr_str = JSON.stringify(arr)
const reverse_arr = JSON.parse(arr_str);
console.log(reverse_arr.map((e) => e ** 2));

console.log(typeof JSON.parse('[]'))

const arl = [1, 2, 3, 4, 5];
for (const beneficiary of arl) {
    if (beneficiary === 2) {
        arl.splice(arl.indexOf(beneficiary), 1);
    }
}
console.log(arl);

let reg = new RegExp(
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
);

let text = 'funded-32ecd7f0-ebf2-474c-b7df-84420ecd8840';

// try to match the regex.
let result = text.substring(7, text.length);
console.log(result);
let objA = {}
let objB = {}
console.log(objA == objB);
