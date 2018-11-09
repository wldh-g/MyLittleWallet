// (c) Yuoa
// Do mkdir recursively

import path from "path";
import fs from "fs";

export default joinedDirPath => {
    var dirPath = joinedDirPath.split(path.sep).slice(1);
    var lastPath = path.parse(joinedDirPath).root;

    return new Promise(async (ok, no) => {
        while (dirPath.length > 0) {
            try {
                lastPath = path.normalize(
                    `${lastPath}${path.sep}${dirPath.splice(0, 1)}`
                );

                await fs.mkdirSync(lastPath);
            } catch (e) {
                if (e.code == "EACCESS" || e.code == "ENOENT") no(e);
                else continue;
            }
        }

        ok(lastPath);
    });
};

