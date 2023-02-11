import { watch } from 'node:fs';
import { exec } from "child_process";

watch('out/parser.js', (curr, prev) => {
    exec('node out/parser.js', (error, stdout) => {
        if (error) {
            console.error(`${error.message}`);
            return;
        }
        console.log(stdout);
    });
});

