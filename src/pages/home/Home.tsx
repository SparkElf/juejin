import './Home.styl'

import { OptionBar } from '../../common/components/OptionBar/OptionBar'
import { loadNewData, PostItem } from './components/PostList'
import { LazyList } from '../../common/components/LazyList/LazyList'

import { SideBar } from './components/SideBar'
import { useEffect, useMemo, useState } from 'react'
import { useForceUpdate, useObservableState } from '../../common/hook/Hook'
import { AppContext } from '../..'
import { getCategories } from '../../fake-api'
import { TabBar } from '../../common/components/TabBar/TabBar'

const headerData = ['推荐', '后端', '前端', 'Android', 'iOS', '人工智能', '开发工具', '代码人生', '阅读']
const listHeaderData = ['热门', '最新', '历史']
export const Home = () => {
    const [listType, setListType] = useState(0)//推荐 后端 前端
    const [secondListType, setSecondListType] = useState(-1)//ios 安卓
    const [postType, setPostType] = useState(0)//热门 最新 历史
    const [dataStore, setDataStore] = useState([])
    const [categories, setCateGories] = useState(null)
    const forceUpdate = useForceUpdate()
    const parentSharedState = useObservableState(AppContext, forceUpdate)[0]
    const loadData = useMemo(() => {
        setDataStore([])
        return loadNewData(secondListType == -1 ? listType : (listType * 10 + secondListType + 1), postType, 0, 30)
    }, [listType, postType, secondListType])
    useEffect(() => {
        getCategories().then(res => {
            setCateGories(res.data.categories)
            console.log(res)
        })
    }, [])
    console.log("secondListType", secondListType)
    return (
        <>
            <div className="page">
                <div className={`headerBar${parentSharedState.scrollEnough ? " active" : ""}`}>
                    <OptionBar data={headerData} select={listType} onSelect={function (key) { setListType(key); setSecondListType(-1); }} />

                </div>
                <div className='subHeaderBar'>
                    <div className='row'>
                        {
                            categories != null && listType != 0 && listType <= 4 ? function () {
                                let names = categories[listType].children.map(child => {
                                    return child.category_name
                                })
                                return (
                                    <TabBar data={names} select={secondListType} onSelect={function (key) { setSecondListType(key) }} />
                                )
                            }() : null

                        }
                    </div>
                </div>

                <div className='pageContent'>
                    <div className='listArea'>
                        <div className="listHeader">
                            <OptionBar data={listHeaderData} select={postType} fence={true} onSelect={function (key) { setPostType(key); setDataStore([]) }} />
                        </div>
                        <LazyList
                            size={30}
                            key={listType * 100 + secondListType * 10 + postType * 1}
                            scrollTarget={document.documentElement}
                            basis={1400}
                            dataStore={dataStore}//数据仓库和数据源的概念不同
                            loadInitData={loadData}
                            loadNewData={loadData}
                            Item={PostItem}
                        />
                    </div>
                    <SideBar></SideBar>
                </div>

            </div>
        </>
    )
}
export default Home