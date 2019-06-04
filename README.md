[English Documentation](./README_EN.md)

# material-blocks

这个仓库用来存放 bizcharts 区块物料。

> 区块指的是在业务场景下沉淀出来的组件。

## 如何新增区块

```bash
npm run add
```

这个命令执行后会在 *packages* 目录下新增一个新的目录

## 如何开发区块

```
cd packages/[block]

npm start
```

## 如何给区块打标

- 手动: 修改区块的 package.json 文件的 **blockConfig.categories** 字段.
- 自动: 当你初始化区块的时候，程序会让你选择

## 更新资源

一旦合并代码请求（MR）被仓库开发者接受，那么区块相关静态资源将会被自动更新到[区块列表页](bizcharts.net)