
import { createContext, lazy, PureComponent, ReactNode, Suspense, useEffect, useState } from "react";
import { GlobalState, ObservableController } from "./common/context/context";

export const AppContext = createContext(new ObservableController(null))

import { render } from "react-dom";

import './index.styl'
import { Header, links as headerLinks } from "./pages/Header";
import { Footer } from "./pages/Footer";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useForceUpdate, useObservableState } from "./common/hook/Hook";

const Information = lazy(() => import(/*webpackChunkName:'Information',webpackPrefetch: true */"./pages/information/Information"))
const Hot = lazy(() => import(/*webpackChunkName:'Hot',webpackPrefetch: true */"./pages/hot/Hot"))
const Course = lazy(() => import(/*webpackChunkName:'Course',webpackPrefetch: true */"./pages/course/Course"))
const Activity = lazy(() => import(/*webpackChunkName:'Activity',webpackPrefetch:true */"./pages/activity/Activity"))
const Detail = lazy(() => import(/*webpackChunkName:'Detail',webpackPrefetch: true */"./pages/detail/Detail"))
const Home = lazy(() => import(/*webpackChunkName:'Home',webpackPrefetch: true */"./pages/home/Home"))
interface AppSharedState {
    scrollEnough: boolean,
    headerSelect: number
}
const GlobalGard = ({ children }) => {
    const forceUpdate = useForceUpdate()
    const [sharedState, notify] = useObservableState(AppContext, forceUpdate) as [AppSharedState, any]
    const location = useLocation()
    let match = false
    for (let i = 0; i < headerLinks.length; i++)
        if (headerLinks[i] == location.pathname) {
            sharedState.headerSelect = i
            match = true
            break
        }
    if (match == false) sharedState.headerSelect = -1
    useEffect(() => {
        notify()
    }, [sharedState.headerSelect])
    return children
}

class App extends PureComponent {
    sharedState = { scrollEnough: false, headerSelect: 0 }
    sharedStateController = new ObservableController(this.sharedState)
    constructor(props) {
        super(props)
        window.addEventListener('scroll', this.listener)
        window.onbeforeunload = function (e) {
            localStorage.removeItem('articleHistory')
            localStorage.setItem('articleHistory', JSON.stringify(GlobalState.articleHistory))
        }
        GlobalState.articleHistory = JSON.parse(localStorage.getItem('articleHistory'))
        if (GlobalState.articleHistory == null) GlobalState.articleHistory = []
    }
    componentWillUnmount(): void {
        window.removeEventListener('scroll', this.listener)
    }
    listener = () => {
        if (document.documentElement.scrollTop > 1000 && !this.sharedState.scrollEnough) {
            this.sharedState.scrollEnough = true
            this.sharedStateController.notify()
        }

        else if (document.documentElement.scrollTop <= 1000 && this.sharedState.scrollEnough) {
            this.sharedState.scrollEnough = false
            this.sharedStateController.notify()
        }
    }
    //provider中不能直接匿名对象赋值 https://zh-hans.reactjs.org/docs/context.html 会导致不必要的重渲染
    render(): ReactNode {

        return (
            <>
                <AppContext.Provider value={this.sharedStateController}>
                    <GlobalGard>
                        <Header />
                        <Outlet></Outlet>
                        <Footer />
                    </GlobalGard>
                </AppContext.Provider>
            </>
        )
    }

}

render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} >
                <Route index element={<Suspense fallback="...loading"><Home /></Suspense>} />
                <Route path="detail/:article_id" element={<Suspense fallback="...loading"><Detail /></Suspense>} />
                <Route path="hot" element={<Suspense fallback="...loading"><Hot /></Suspense>}></Route>
                <Route path="information" element={<Suspense fallback="...loading"><Information /></Suspense>}></Route>
                <Route path="course" element={<Suspense fallback="...loading"><Course /></Suspense>}></Route>
                <Route path="activity" element={<Suspense fallback="...loading"><Activity /></Suspense>}></Route>
            </Route>
        </Routes>
    </BrowserRouter>
    , document.getElementById("App"));


