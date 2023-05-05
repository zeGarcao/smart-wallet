import React from "react";
import {
    CHAIN_ID_HEX,
    changeChain,
    getChainId,
    setOnChainChangedListener,
} from "../web3/web3-utils";

function ChainChange({ account }) {
    const [chainId, setChainId] = React.useState(undefined);

    React.useEffect(() => {
        const setup = async () => {
            const onChainChanged = _chainId => {
                setChainId(_chainId);
            };

            const currentChainId = await getChainId();
            setOnChainChangedListener(onChainChanged);
            setChainId(currentChainId);
        };

        setup();
    }, []);

    const changeNetwork = async () => {
        await changeChain();
    };

    return (
        <section
            className="chain-change"
            style={{
                display: account && chainId != CHAIN_ID_HEX ? "flex" : "none",
            }}>
            <div>
                <h2>wrong network!</h2>
                <button onClick={changeNetwork}>change network</button>
            </div>
        </section>
    );
}

export default ChainChange;
