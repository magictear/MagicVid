const fs = require('fs');
var multer = require('multer');

// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // 创建文件夹
        var createFolder = function(folder) {
            try {
                // 测试 path 指定的文件或目录的用户权限,我们用来检测文件是否存在
                // 如果文件路径不存在将会抛出错误"no such file or directory"
                fs.accessSync(folder);
            } catch (e) {
                // 文件夹不存在，以同步的方式创建文件目录。
                fs.mkdirSync(folder);
            }
        };
        var uploadFolder = './magic/' + req.body.classification + "/";
        createFolder(uploadFolder);
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, uploadFolder);
    },
    filename: function(req, file, cb) {
        // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
        cb(null, file.originalname);
    }
});




// 创建 multer 对象
var upload = multer({ storage: storage });

module.exports = upload;