import { Dispatch, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { Avatar } from "../../common/components/Avatar/Avatar"
import { CommentEditor } from "../../common/components/CommentEditor/CommentEditor"
import { QRCode } from "../../common/components/QRCode/QRCode"
import { getNestedHeadings, TableOfContents } from "../../common/components/TableOfContents/TableOfContents"
import { GlobalState } from "../../common/context/context"
import { useForceUpdate } from "../../common/hook/Hook"
import { date2str } from "../../common/util/time"
import { getArticleById, getCommentsByArticleId } from "../../fake-api"

import { CommentList } from "./components/CommentList"
import './Detail.styl'

interface DetailState {
    article: any,
    comment: any
}
export const Detail = (props) => {//详情页无状态 历史记录在Detail页面产生
    const params = useParams()
    const location = useLocation()
    const [state, setState] = useState(location.state as any) as [DetailState, Dispatch<any>]
    //如果有提供的数据则不发起网络请求，否则调用getArticleByID接口
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [leftCommentNum, setleftCommentNum] = useState(0)

    console.log(state)
    if (state == null) {
        getArticleById(params.article_id).then(res => {
            setState({ article: res.data.article })
        })
        return null
    } else if (state.comment == null) {
        getCommentsByArticleId(params.article_id).then(res => {
            setState({ ...state, comment: res.data.comments })
            if (res.total > 10) setleftCommentNum(res.total - 10)
        })
    } else if (!historyLoaded) {
        console.log('最终state', state)
        setHistoryLoaded(true)
        GlobalState.articleHistory.push(state.article)
        console.log('HistoryArray', GlobalState.articleHistory)
    }
    return (
        <div className="detailPage">
            <div className="article">
                <div className="authorBar">
                    <div className="authorInfo">
                        <Avatar src={state.article.author_user_info.avatar_large} size="40px" />
                        <div className="column">
                            <div className="row">
                                <span className="name">{state.article.author_user_info.user_name}</span>
                                <img className="rank" src="https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/f597b88d22ce5370bd94495780459040.svg" />
                            </div>
                            <span className="statistics">{date2str(new Date(parseInt(state.article.article_info.ctime) * 1000), 'yyyy年MM月dd日 hh:mm')} ·  阅读 {state.article.article_info.view_count}</span>
                        </div>
                    </div>
                    <button >+关注</button>
                </div>
                <div className="cover">
                    <img src={state.article.article_info.cover_image}></img>
                </div>
                <h1 className="title">{state.article.article_info.title}</h1>
                <div className="content" dangerouslySetInnerHTML={{ __html: state.article.article_content }} />
                <div className="commentArea">
                    <div className="header">
                        <span>评论</span>
                        <div className="writeArea">
                            <Avatar src="https://p9-passport.byteacctimg.com/img/mosaic-legacy/3793/3131589739~120x256.image" size="40px" />
                            <CommentEditor />
                        </div>
                        <span >热门评论
                            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" ><path d="M12.8 5.2C13.9532 6.46 14.8 8.2 14.8 10C14.7039 12.8937 12.6843 15.1706 9.97973 15.8159C10.359 12.3442 7.77588 9.35406 7.77588 9.35406C7.77588 9.35406 7.99512 13.7064 6.79514 15.8104C4.03715 15.1428 2 12.7806 2 9.8C2 7.776 2.9336 5.9728 4.4 4.8C5.8608 3.7056 6.8 1.9656 6.8 0C9.684 0.4368 11.894 2.9264 11.894 5.932C11.894 6.5012 11.746 7.0652 11.6 7.6C12.1264 6.9024 12.6184 6.0876 12.8 5.2Z" fill="#F53F3F"></path></svg>
                        </span>
                    </div>
                    <CommentList data={state.comment} />

                </div>
                <div className={`loadBtn${leftCommentNum > 0 ? " show" : ""}`} onClick={
                    () => {
                        getCommentsByArticleId(params.article_id, 10, leftCommentNum).then(res => {
                            setState({ article: state.article, comment: [...state.comment, ...res.data.comments] })
                            setleftCommentNum(0)
                        })
                    }
                }>
                    查看剩余{leftCommentNum}条回复
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="#333" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M5.99976 7.93206L10.0656 3.86619C10.1633 3.76856 10.3215 3.76856 10.4192 3.86619L10.7727 4.21975C10.8704 4.31738 10.8704 4.47567 10.7727 4.5733L6.35331 8.99272C6.15805 9.18798 5.84147 9.18798 5.6462 8.99272L1.22679 4.5733C1.12916 4.47567 1.12916 4.31738 1.22679 4.21975L1.58034 3.86619C1.67797 3.76856 1.83626 3.76856 1.93389 3.86619L5.99976 7.93206Z"></path></svg>
                </div>
            </div>
            <SideBar data={state.article} />
        </div>
    )
}
const SideBar = (props) => {
    let article = props.data
    const [select, setSelect] = useState("spark-toc-0")
    console.log('article', article)
    return (
        <div className="sideBar">
            <div className="authorCard">
                <div className="avatarRow">
                    <Avatar src={article.author_user_info.avatar_large} size="50px" />
                    <span className="name">{article.author_user_info.user_name}</span>
                    <img className="rank" src="https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/f597b88d22ce5370bd94495780459040.svg" />
                </div>
                <div className="statisticRow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 25 26" ><g fill="none" fillRule="evenodd" transform="translate(0 .57)"><ellipse cx="12.5" cy="12.57" fill="#E1EFFF" rx="12.5" ry="12.57"></ellipse> <path fill="#7BB9FF" d="M8.596 11.238V19H7.033C6.463 19 6 18.465 6 17.807v-5.282c0-.685.483-1.287 1.033-1.287h1.563zm4.275-4.156A1.284 1.284 0 0 1 14.156 6c.885.016 1.412.722 1.595 1.07.334.638.343 1.687.114 2.361-.207.61-.687 1.412-.687 1.412h3.596c.38 0 .733.178.969.488.239.317.318.728.21 1.102l-1.628 5.645a1.245 1.245 0 0 1-1.192.922h-7.068v-7.889c1.624-.336 2.623-2.866 2.806-4.029z"></path></g></svg>
                    <span>被点赞 {article.author_user_info.got_digg_count}</span>
                </div>
                <div className="statisticRow">
                    <svg width="25" height="25" viewBox="0 0 25 25"><g fill="none" fillRule="evenodd"><circle cx="12.5" cy="12.5" r="12.5" fill="#E1EFFF"></circle> <path fill="#7BB9FF" d="M4 12.5S6.917 7 12.75 7s8.75 5.5 8.75 5.5-2.917 5.5-8.75 5.5S4 12.5 4 12.5zm8.75 2.292c1.208 0 2.188-1.026 2.188-2.292 0-1.266-.98-2.292-2.188-2.292-1.208 0-2.188 1.026-2.188 2.292 0 1.266.98 2.292 2.188 2.292z"></path></g></svg>
                    <span>被阅读 {article.author_user_info.got_view_count}</span>
                </div>

            </div>
            <QRCode />
            <TableOfContents
                getHeadingElements={() => {
                    let postNode = document.querySelector(".article .content")
                    return Array.from(postNode.querySelectorAll("h1,h2,h3,h4,h5"))//转换为数组方便使用map操作
                }}
                getNestedHeadings={getNestedHeadings}
                select={select}
                onSelect={function (node) { setSelect(node.domNode.id) }}
            />
        </div>
    )
}
export default Detail