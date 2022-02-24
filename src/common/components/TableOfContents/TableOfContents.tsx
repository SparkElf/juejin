import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import './TableOfContents.styl'
interface TableOfContentsProps {
    getHeadingElements: () => any[]
    getNestedHeadings: (array: any[]) => any
    select: string
    onSelect: (node) => void
}
export const TableOfContents = (props: TableOfContentsProps) => {//该组件必须等文章加载结束后再渲染
    const [nestedHeadings, setNestedHeadings] = useHeadings(props.getHeadingElements, props.getNestedHeadings)
    const renderTOCNodes = (node) => {
        console.log('当前节点', node)
        if (node.children.length == 0)//叶子节点
        {
            console.log('叶子')
            if (node.parent == null) return null //文章未加载
            return (
                <a href={`#${node.domNode.id}`} className={node.domNode.id == props.select ? "active" : ""} onClick={() => {
                    props.onSelect(node)
                }
                }>{node.domNode.innerText}</a>
            )
        }

        let jsxNodes = []
        for (let i = 0; i < node.children.length; i++)
            jsxNodes.push((
                <li>{renderTOCNodes(node.children[i])}</li>
            ))
        //递归完成
        console.log(node)
        return (
            <>
                {node.domNode == null ? null : (<a href={`#${node.domNode.id}`} className={node.domNode.id == props.select ? "active" : ""} onClick={
                    () => {
                        props.onSelect(node)
                    }
                }>{node.domNode.innerText}</a>)
                }
                <ul>
                    {jsxNodes}
                </ul>
            </>
        )
    }
    return (

        <nav className='toc'>
            <div className='header'>目录</div>
            {
                nestedHeadings == null ? null : renderTOCNodes(nestedHeadings)
            }
        </nav>
    );

}
//TODO 异步组件待优化
const useHeadings = (getHeadingElements, getNestedHeadings) => {
    const [nestedHeadings, setNestedHeadings] = useState(null);
    useEffect(() => {
        const headingElements = getHeadingElements()
        const newNestedHeadings = getNestedHeadings(headingElements);//自己决定嵌套方式
        setNestedHeadings(newNestedHeadings);
    }, []);

    return [nestedHeadings, setNestedHeadings];
}
export const getNestedHeadings = (headingElements) => {
    const nestedHeadings = {
        parent: null,
        children: []
    };
    let rank = {
        "H1": 1, "H2": 2, "H3": 3, "H4": 4, "H5": 5, "H6": 6,
    }
    let curNode: any = nestedHeadings
    headingElements.forEach((heading, index) => {
        heading.id = "spark-toc-" + index//注意js默认引用，这个操作会直接修改dom元素
        const { innerText: title, id } = heading;

        while (curNode.parent != null && rank[curNode.domNode.nodeName] >= rank[heading.nodeName])//回溯
            curNode = curNode.parent
        let node = {
            parent: curNode,
            domNode: heading,
            children: []
        }
        curNode.children.push(node)
        curNode = node
    });
    return nestedHeadings
};
