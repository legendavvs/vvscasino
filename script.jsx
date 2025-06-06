const { useState, useRef } = React;



function SlotMachine() {
    const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍓'];
    const [slotCount, setSlotCount] = useState(5);
    const [slots, setSlots] = useState([0, 0, 0, 0, 0]);
    const [spinningState, setSpinningState] = useState(false);
    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(""); // Початкове значення тепер ""
    const [message, setMessage] = useState(""); // Додаємо стан для повідомлення
    const [showModal, setShowModal] = useState(false);
    const [addAmount, setAddAmount] = useState(""); // було 0, стало ""
    const [history, setHistory] = useState([]);
    const [isMuted, setIsMuted] = useState(false); // Додаємо стан mute
    const spinning = useRef(false);
    const audioRef = useRef(null); // Додаємо ref для аудіо
    const appearedHistory = useRef(new Set());

    function spinSlots() {
        const betValue = Number(bet);
        if (spinning.current || betValue > balance || betValue <= 0) {
            if (betValue <= 0) setMessage("Введіть ставку більше 0");
            return;
        }
        if (audioRef.current && !isMuted) { // Додаємо перевірку mute
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
        spinning.current = true;
        setSpinningState(true);
        setMessage("");
        let spins = 15;
        let finalSlots = [];
        let interval = setInterval(() => {
            const newSlots = Array.from({ length: slotCount }, () =>
                Math.floor(Math.random() * symbols.length)
            );
            setSlots(newSlots);
            finalSlots = newSlots;
            spins--;
            if (spins === 0) {
                clearInterval(interval);
                spinning.current = false;
                setSpinningState(false);
                checkWin(finalSlots);
            }
        }, 190);
    }

    function checkWin(finalSlots) {
        const counts = {};
        finalSlots.forEach(idx => {
            counts[idx] = (counts[idx] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(counts));
        let winAmount = 0;

        if (slotCount === 3 && maxCount === 3) {
            winAmount = bet * 7;
            setTimeout(() => {
                setBalance(balance + winAmount);
                setMessage(`Джекпот! +${winAmount} до балансу (x7)`);
                setHistory(prev => {
                    const newHistory = [
                        `Ставка: ${bet} | Виграш: +${winAmount} (x7)`,
                        ...prev
                    ];
                    return newHistory.slice(0, 5);
                });
            }, 700);
        } else if (maxCount >= 3) {
            winAmount = bet * maxCount;
            setTimeout(() => {
                setBalance(balance + winAmount);
                setMessage(`Виграш! +${winAmount} до балансу`);
                setHistory(prev => {
                    const newHistory = [...prev, `Ставка: ${bet} | Виграш: +${winAmount}`];
                    return newHistory.slice(-5); // залишаємо останні 5
                });
            }, 700);
        } else {
            setTimeout(() => {
                setBalance(balance - bet);
                setMessage(`Програш! -${bet} з балансу`);
                setHistory(prev => {
                    const newHistory = [
                        `Ставка: ${bet} | Програш: -${bet}`,
                        ...prev
                    ];
                    return newHistory.slice(0, 5);
                });
            }, 700);
        }
    }

    function switchmode() {
        if (spinning.current) return;
        const newCount = slotCount === 5 ? 3 : 5;
        setSlotCount(newCount);
        setSlots(Array(newCount).fill(0));
    }

    function handleBetChange(e) {
        const value = e.target.value;
        if (value === "" || /^[0-9\b]+$/.test(value)) {
            setBet(value);
        }
    }

    function handleAddBalance() {
        setShowModal(true);
        setAddAmount(""); // було 0, стало ""
    }

    function handleConfirmAdd() {
        setBalance(balance + Number(addAmount));
        setShowModal(false);
        setAddAmount(0);
    }

    function handleCancelAdd() {
        setShowModal(false);
        setAddAmount(0);
    }

    function handleBackdropClick() {
        setShowModal(false);
        setAddAmount("");
    }

    React.useEffect(() => {
        const balanceElem = document.getElementById('balance-value');
        if (balanceElem) balanceElem.textContent = balance;
    }, [balance]);

    React.useEffect(() => {
        // Додаємо контейнер для particles.js у body, якщо його ще немає
        let particlesDiv = document.getElementById('particles-js');
        if (!particlesDiv) {
            particlesDiv = document.createElement('div');
            particlesDiv.id = 'particles-js';
            Object.assign(particlesDiv.style, {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none'
            });
            document.body.prepend(particlesDiv);
        }

        const balanceElem = document.getElementById('balance-value');
        if (balanceElem) balanceElem.textContent = balance;
        // Додаємо обробник на кнопку Add Balance з header
        const btn = document.querySelector('.nav button');
        if (btn) btn.onclick = handleAddBalance;

        // Додаємо particles.js якщо ще не додано
        const particlesConfig = {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "window", // реагує на мишку по всьому вікну
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        };

        function initParticles() {
            if (window.pJSDom && window.pJSDom.length) {
                window.pJSDom.forEach(p => p.pJS && p.pJS.fn.vendors.destroypJS());
                window.pJSDom = [];
            }
            window.particlesJS('particles-js', particlesConfig);
        }

        if (!window.particlesJS) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
            script.onload = initParticles;
            document.body.appendChild(script);
        } else {
            initParticles();
        }
    }, []);

    React.useEffect(() => {
        // Очищаємо appearedHistory, якщо історія очищена
        if (history.length === 0) appearedHistory.current.clear();
    }, [history]);

    return (
        <div style={{position: 'relative', minHeight: '100vh'}}>
            {/* Додаємо аудіо-елемент */}
            <audio ref={audioRef} src="spin (1).mp3" preload="auto" />
            <div style={{position: 'relative', zIndex: 1}}>
                <div className='slots-row'>
                    {slots.map((idx, i) => (
                        <span key={i}>{symbols[idx]}</span>
                    ))}
                </div>
                {/* ОКРЕМИЙ РЯДОК ДЛЯ СТАВКИ */}
                <div style={{width: '100%', margin: '0 0 0.7rem 0'}}>
                    <input
                        type="number"
                        className="betamount"
                        placeholder="Your Bet"
                        value={bet}
                        min="1"
                        max={balance}
                        onChange={handleBetChange}
                        disabled={spinningState}
                    />
                </div>
                <div className='buttons'>
                    <button className="buttonplay" onClick={spinSlots} disabled={spinningState || bet > balance || bet <= 0}>Почати</button>
                    <button className='switchmode' onClick={switchmode} disabled={spinningState}>Режим</button>
                    <button
                        className={`buttonmute${isMuted ? ' muted' : ''}`}
                        disabled={spinningState}
                        onClick={() => setIsMuted(m => !m)}
                        style={{
                            backgroundColor: isMuted ? '#d9534f' : 'rgba(110, 110, 110, 0.603)',
                            fontWeight: isMuted ? 'bold' : 'normal',
                            fontSize: '1.4rem'
                        }}
                    >
                        {isMuted ? 'Без звуку' : 'Звук'}
                    </button>
                    <button className='buttoncount' disabled={spinningState} onClick={() => setBet(b => Math.max(1, b - 50))}>-50</button>
                    <button className='buttoncount' disabled={spinningState} onClick={() => setBet(b => Math.max(1, b - 100))}>-100</button>
                    <button className='buttoncount' disabled={spinningState} onClick={() => setBet(b => Math.min(balance, b + 50))}>+50</button>
                    <button className='buttoncount' disabled={spinningState} onClick={() => setBet(b => Math.min(balance, b + 100))}>+100</button>
                    <button
                        className="restorebet buttoncount"
                        disabled={spinningState}
                        onClick={() => setBet(0)}
                    
                        style={{fontSize: '1.2rem'}}>
                        Очистити ставку
                    </button>
                </div>
                <div className="main-message">{message}</div>
                {/* History */}
                <section className="historylist">
                    <h2>Історія</h2>
                    <ul className="history">
                        {history.length === 0
                            ? <li className="historyitem">Історія порожня</li>
                            : history.map((item, idx) => {
                                // Унікальний ключ для кожного запису (можна використати timestamp або інший унікальний ідентифікатор)
                                const key = item + idx;
                                const isNew = !appearedHistory.current.has(key);
                                if (isNew) appearedHistory.current.add(key);
                                return (
                                    <li
                                        className={`historyitem${isNew ? ' historyitem-appear' : ''}`}
                                        key={key}
                                    >
                                        {item}
                                    </li>
                                );
                            })
                        }
                    </ul>
                </section>
                {/* Модальне вікно */}
                {showModal && (
                    <div className={`addbalance-modal-backdrop${showModal ? ' show' : ''}`} onClick={handleBackdropClick}>
                        <div className="addbalance-modal" onClick={e => e.stopPropagation()}>
                            <h3>Поповнення балансу</h3>
                            <input
                                type="number"
                                min="1"
                                value={addAmount}
                                onChange={e => setAddAmount(e.target.value)}
                                placeholder="Сума"
                            />
                            <div className="modal-buttons">
                                <button onClick={handleConfirmAdd} disabled={addAmount <= 0}>Додати</button>
                                <button onClick={handleCancelAdd}>Скасувати</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.querySelector('.mainwindow')).render(<SlotMachine />);