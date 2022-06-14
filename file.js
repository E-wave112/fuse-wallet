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
