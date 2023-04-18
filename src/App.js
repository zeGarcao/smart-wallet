import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./css/index.css";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import RecoveryStats from "./pages/RecoveryStats";
import RecoveryHistory from "./pages/RecoveryHistory";
import Header from "./components/Header";

function App() {
    return (
        <>
            <Router>
                <Header />
                <Switch>
                    <Route exact path="/">
                        <Dashboard />
                    </Route>
                    <Route exact path="/transactions">
                        <Transactions />
                    </Route>
                    <Route exact path="/settings">
                        <Settings />
                    </Route>
                    <Route exact path="/recovery-stats">
                        <RecoveryStats />
                    </Route>
                    <Route exact path="/recovery-history">
                        <RecoveryHistory />
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
