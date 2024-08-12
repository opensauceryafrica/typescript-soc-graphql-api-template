import fs from 'fs';

/**
 * read reads a file and returns its content as a string or if it is a folder, it recursively reads all files in the folder and returns the content as a string.
 * @param file
 */
export function read(path: string): string {
    let content = '';
    if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
            const files = fs.readdirSync(path);
            files.forEach((file) => {
                content += read(`${path}/${file}`);
            });
        } else {
            content = fs.readFileSync(path, 'utf8');
        }
    }
    return content;
}
