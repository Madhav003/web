//  Create and display multi-dimensional JSON Arrays, also demonstrate Accessing individual elements of the multi-dimensional JSON Arrays.

let arr = [
    [
        { "name": "Maddy", "age": 30 },
        { "name": "Mark", "age": 25 }
    ],
    [
        { "name": "Mike", "age": 35 },
        { "name": "Emily", "age": 28 }
    ]
];

console.log("Multi-dimensional JSON Array:");
console.log(JSON.stringify(arr, null, 2));
