# 在自己的服务器上部署 STX 网站

站点放在域名根目录。中文首页是 `/`，中文文档是 `/docs/`；英文首页是 `/en/`，英文文档是 `/en/docs/`。**不要**把构建产物再放进服务器的 `/docs` 子目录，否则路径会重复。

## 本地预览（中英文）

`docusaurus start` **一次只跑一种语言**。在开发服里点语言切换跳到 `/en/…` 会 404，这是 Docusaurus 限制，不是英文文档没了。

| 目的 | 命令 | 打开 |
| :--- | :--- | :--- |
| 日常改中文 | `pnpm start` | http://localhost:3000/docs/ |
| 只改英文 | `pnpm start:en` | http://localhost:3002/**en**/docs/ |
| 中英文切换 | `pnpm preview` | http://localhost:3002/docs/ 与 /en/docs/ |

## 构建

在构建机上设置实际访问域名，并生成静态文件：

```bash
pnpm install --frozen-lockfile
SITE_URL=https://docs.example.com pnpm build
```

把 `https://docs.example.com` 换成你自己的域名。未设置 `SITE_URL` 时，构建会使用 `http://localhost:3000`，仅供本地预览。

`build/` 就是需要交给 Web 服务器的目录。不需要在服务器上启动 Docusaurus 开发服务。

## Nginx 示例

将 `build/` 中的文件放进 `/var/www/stx-site/`，然后按实际域名和目录修改配置：

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/stx-site;
    index index.html;

    # 如果旧链接曾使用 /stx-website/，将它转到新的根路径。
    location ^~ /stx-website/ {
        rewrite ^/stx-website/(.*)$ /$1 permanent;
    }

    location / {
        # 静态站点：有文件就返回；不要一律回落到中文 index.html，否则 /en/* 会错页
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    # 英文 404（可选，按目录区分）
    location ^~ /en/ {
        try_files $uri $uri/ /en/404.html;
    }
}
```

配置生效后，分别打开 `/`、`/docs/`、`/en/` 和 `/en/docs/`，并从语言菜单切换一次。若服务器已有反向代理，请让这四个路径都指向同一份 `build/` 文件。

GitHub Actions 目前只检查构建，不再发布到 GitHub Pages。
