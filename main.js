class FrameEndComponent {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.currentEra = 1;
        this.scrollAccumulated = 0;
        this.maxScrollDistance = 1000;
        this.bufferDistance = 3300;
        this.holdScroll = false;
        this.initialScrollBuffer = 0;  // 添加初始滚动缓冲
        this.initialBufferThreshold = 500;  // 初始缓冲阈值

        // DOM elements
        this.frameEed = document.getElementById('frame-Eed');
        this.endIcon = document.querySelector(".End-icon");
        this.restartButton = document.querySelector(".Restart-button");
        this.exitButton = document.querySelector(".Exit-button");
        this.frameEpilogue = document.querySelector(".frame-Epilogue");

        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);

    }
    initializeMap() {
        // 获取当前地图ID
        const currentMap = window.sourceMapId || '1';

        // 初始化时直接显示正确的地图
        this.activateMap(currentMap, true); // true表示是初始化

        // 为所有地图添加过渡效果
        const maps = document.querySelectorAll(".box .page");
        maps.forEach(map => {
            map.style.transition = 'opacity 0.5s ease-in-out';
        });
    }

    activateMap(mapId) {
        this.currentMapId = mapId;
        window.sourceMapId = mapId;
        console.log('Activating map:', mapId);
        console.log('Updated sourceMapId to:', window.sourceMapId);
        // 获取所有圆圈和地图
        const circles = document.querySelectorAll("#progress-bar .circle");
        const maps = document.querySelectorAll(".box .page");

        // 当前显示的地图开始淡出
        maps.forEach(map => {
            if (map.classList.contains('open')) {
                map.style.opacity = '0';
            }
        });

        // 更新圆圈状态
        circles.forEach(c => c.classList.remove("active-circle"));
        const index = parseInt(mapId) - 1;
        if (circles[index]) circles[index].classList.add("active-circle");

        // 新地图淡入
        setTimeout(() => {
            maps.forEach(m => m.classList.remove("open"));
            if (maps[index]) {
                maps[index].classList.add("open");
                requestAnimationFrame(() => {
                    maps[index].style.opacity = '1';
                });
            }

            // 更新点击框
            this.showClickBoxesForMap(mapId);

            // 更新放大镜内容
            const magnifierContent = document.getElementById("magnifier-content");
            const page = document.getElementById(`map${mapId}`);
            if (page && magnifierContent) {
                const gifPath = page.getAttribute('data-gif');
                magnifierContent.src = gifPath;
            }
        }, 300);

        // 新地图淡入
        setTimeout(() => {
            maps.forEach(m => m.classList.remove("open"));
            if (maps[index]) {
                maps[index].classList.add("open");
                requestAnimationFrame(() => {
                    maps[index].style.opacity = '1';
                });
            }
        }, 300);

        // 更新其他相关内容
        this.showClickBoxesForMap(mapId);

        // 更新放大镜内容
        const magnifierContent = document.getElementById("magnifier-content");
        const page = document.getElementById(`map${mapId}`);
        if (page && magnifierContent) {
            const gifPath = page.getAttribute('data-gif');
            magnifierContent.src = gifPath;
        }
    }
    // 修改切换到地图框架的函数
    switchToFrameMap() {
        const frame2 = document.getElementById('frame-2');
        const frameMap = document.getElementById('frame-map');

        // 添加淡出效果
        frame2.style.transition = 'opacity 0.5s ease-in-out';
        frameMap.style.transition = 'opacity 0.5s ease-in-out';

        frame2.style.opacity = '0';

        setTimeout(() => {
            frame2.classList.remove('active');
            frame2.classList.add('hidden');

            frameMap.classList.remove('hidden');
            frameMap.classList.add('active');
            frameMap.style.opacity = '0';

            // 强制重绘
            requestAnimationFrame(() => {
                frameMap.style.opacity = '1';

                // 初始化地图显示
                this.initializeMap();
            });
        }, 500);
    }

    unblurMapWithProgress(progress) {
        if (this.frameMap) {
            const blurAmount = 8 * (1 - progress); // 最大模糊值为8px
            const elementsToUpdate = this.frameMap.querySelectorAll(
                '#progress-bar, .box, #click-box-container, #message-container'
            );

            elementsToUpdate.forEach(element => {
                element.style.filter = `blur(${blurAmount}px)`;
            });

            // 更新放大镜可见性
            const magnifier = document.getElementById('magnifier');
            const progressRingContainer = document.getElementById('progress-ring-container');

            if (magnifier && progressRingContainer) {
                if (progress >= 1) {
                    magnifier.style.display = 'block';
                    progressRingContainer.style.display = 'block';
                    magnifier.style.filter = 'none';
                    progressRingContainer.style.filter = 'none';
                } else {
                    magnifier.style.display = 'none';
                    progressRingContainer.style.display = 'none';
                }
            }
        }
    }
    handleScroll(event) {
        event.preventDefault();

        // 第一页不允许向上滚动
        if (this.currentEra === 1 && event.deltaY < 0) {
            this.scrollAccumulated = 0;
            this.initialScrollBuffer = 0;  // 重置初始缓冲
            return;
        }

        // 第一页的初始滚动缓冲
        if (this.currentEra === 1 && this.initialScrollBuffer <= this.initialBufferThreshold) {
            this.initialScrollBuffer += Math.abs(event.deltaY);
            if (this.initialScrollBuffer <= this.initialBufferThreshold) {
                // 还在缓冲阶段，不执行实际滚动
                const era1 = document.querySelector('.Epilogue-Era1');
                if (era1) {
                    // 添加轻微的视觉反馈
                    const bufferRatio = this.initialScrollBuffer / this.initialBufferThreshold;
                    era1.style.transform = `translate(-50%, -50%) scale(${1 - bufferRatio * 0.03})`;
                }
                return;
            }
        }

        // 处理缓冲状态
        if (this.holdScroll) {
            this.scrollAccumulated += event.deltaY;
            if (Math.abs(this.scrollAccumulated) > this.bufferDistance) {
                this.holdScroll = false;
                this.scrollAccumulated = 0;
            }
            return;
        }

        // 累加滚动距离
        this.scrollAccumulated += event.deltaY;
        this.scrollAccumulated = Math.max(-this.maxScrollDistance,
            Math.min(this.maxScrollDistance, this.scrollAccumulated));

        const scrollRatio = this.scrollAccumulated / this.maxScrollDistance;

        // 如果当前是 Era4，处理与按钮的过渡
        if (this.currentEra === 4) {
            const frameMap = document.getElementById('frame-map');

            if (scrollRatio > 0) {
                // 向下滚动到按钮页
                const era4 = document.querySelector('.Epilogue-Era4');
                if (era4) {
                    era4.style.opacity = `${1 - scrollRatio}`;
                    era4.style.filter = `blur(${scrollRatio * 10}px)`;
                }

                // 同步处理 map 的模糊淡出
                if (frameMap) {
                    frameMap.style.opacity = `${1 - scrollRatio}`;
                    const elementsToBlur = frameMap.querySelectorAll(
                        '#progress-bar, .box, #click-box-container, #message-container'
                    );
                    elementsToBlur.forEach(element => {
                        element.style.filter = `blur(${(1 - scrollRatio) * 8}px)`;
                    });
                }

                if (scrollRatio >= 1) {
                    // 完全切换到按钮页
                    era4.style.visibility = 'hidden';
                    if (frameMap) frameMap.style.display = 'none';
                    this.currentEra = 5; // 标记当前在按钮页
                    this.scrollAccumulated = 0;
                }
                this.updateEndButtons(scrollRatio);
            } else if (scrollRatio < 0) {
                // 向上滚回 Era3
                this.hideEndButtons(-scrollRatio);
                const era4 = document.querySelector('.Epilogue-Era4');
                const era3 = document.querySelector('.Epilogue-Era3');
                if (era4 && era3) {
                    this.updateElementStyles(era4, era3, scrollRatio);
                    this.checkPageTransition(scrollRatio, era4);
                }

                // 保持 map 的模糊效果
                if (frameMap) {
                    frameMap.style.opacity = '1';
                    frameMap.style.display = 'block';
                    const elementsToBlur = frameMap.querySelectorAll(
                        '#progress-bar, .box, #click-box-container, #message-container'
                    );
                    elementsToBlur.forEach(element => {
                        element.style.filter = 'blur(8px)';
                    });
                }
            }
        } else if (this.currentEra === 5) { // 当前在按钮页
            if (scrollRatio < 0) {
                // 向上滚回 Era4
                const era4 = document.querySelector('.Epilogue-Era4');
                if (era4) {
                    era4.style.visibility = 'visible';
                    era4.style.opacity = `${-scrollRatio}`;
                    era4.style.filter = `blur(${(1 + scrollRatio) * 10}px)`;
                }
                if (scrollRatio <= -1) {
                    // 完全回到 Era4
                    this.currentEra = 4;
                    this.scrollAccumulated = 0;
                    era4.style.opacity = '1';
                    era4.style.filter = 'blur(0px)';
                    this.hideEndButtons(1);
                }
                this.updateEndButtons(1 + scrollRatio);
            }
        } else {
            // 正常的 Era 切换
            const currentElement = document.querySelector(`.Epilogue-Era${this.currentEra}`);
            const nextElement = scrollRatio > 0
                ? document.querySelector(`.Epilogue-Era${this.currentEra + 1}`)
                : document.querySelector(`.Epilogue-Era${this.currentEra - 1}`);

            if (currentElement && nextElement) {
                this.updateElementStyles(currentElement, nextElement, scrollRatio);
                if (this.checkPageTransition(scrollRatio, currentElement)) {
                    // 页面切换后重置初始缓冲
                    this.initialScrollBuffer = 0;
                }
            }
        }
    }

    show() {
        if (this.frameEed) {
            this.frameEed.style.display = 'block';
            this.frameEpilogue.style.display = 'flex';
            this.frameEed.addEventListener('wheel', this.handleScroll);
            this.initializeButtons();

            // 确保第一张图片显示
            const era1 = document.querySelector('.Epilogue-Era1');
            if (era1) {
                era1.style.visibility = 'visible';
                era1.style.opacity = '1';
                era1.style.filter = 'blur(0)';
            }
        }
    }

    initializeButtons() {
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                window.location.reload();
            });
        }

        if (this.exitButton) {
            this.exitButton.addEventListener('click', () => {
                window.close();
            });
        }
    }



    updateEndButtons(ratio) {
        if (ratio > 0.5) {
            const buttonOpacity = (ratio - 0.5) * 2;
            [this.endIcon, this.restartButton, this.exitButton].forEach(element => {
                if (element) {
                    element.style.display = element === this.endIcon ? 'block' : 'flex';
                    element.style.opacity = buttonOpacity;
                }
            });
        }
    }

    hideEndButtons(ratio) {
        [this.endIcon, this.restartButton, this.exitButton].forEach(element => {
            if (element) {
                element.style.opacity = `${1 - ratio}`;
                if (ratio === 1) {
                    element.style.display = 'none';
                }
            }
        });
    }

    updateElementStyles(currentElement, nextElement, scrollRatio) {
        currentElement.style.filter = `blur(${10 * Math.abs(scrollRatio)}px)`;
        currentElement.style.opacity = `${1 - Math.abs(scrollRatio)}`;
        currentElement.style.transform = `translate(-50%, calc(-50% + ${scrollRatio * -1000}px))`;

        nextElement.style.visibility = 'visible';
        nextElement.style.filter = `blur(${10 * (1 - Math.abs(scrollRatio))}px)`;
        nextElement.style.opacity = `${Math.abs(scrollRatio)}`;
        nextElement.style.transform = `translate(-50%, calc(-50% + ${(1 - Math.abs(scrollRatio)) * 50}px))`;
    }

    checkPageTransition(scrollRatio, currentElement) {
        if (scrollRatio >= 1 && this.currentEra < 4) {
            this.scrollAccumulated = 0;
            if (currentElement) currentElement.style.visibility = "hidden";
            this.currentEra++;
            this.holdScroll = true;
        } else if (scrollRatio <= -1 && this.currentEra > 1) {
            this.scrollAccumulated = 0;
            if (currentElement) currentElement.style.visibility = "hidden";
            this.currentEra--;
            this.holdScroll = true;
        }
    }

    hide() {
        if (this.frameEed) {
            this.frameEed.style.display = 'none';
            this.frameEed.removeEventListener('wheel', this.handleScroll);
        }
    }
}

// 首先定义NewsComponent类
class NewsComponent {
    constructor() {
        this.initialize();
        this.frameEndComponent = new FrameEndComponent();
    }

    initialize() {
        // DOM elements
        this.okButton = document.querySelector('.ok-button');
        this.frameNews = document.getElementById('frame-News');
        this.frameConsole = document.getElementById('frame-console');
        this.frameMap = document.getElementById('frame-map');
        this.frameEed = document.getElementById('frame-Eed');
        this.container = document.querySelector('.container');
        this.newsFrame = document.querySelector('.frame-TodaysNews');
        this.commentsFrame = document.querySelector('.frame-Comments');
        this.closeButton = document.querySelector('.close2-icon');
        this.newsTextImage = document.getElementById('news-text-image');

        // State variables
        this.offsetY = 0;
        this.isNewsFrameVisible = false;
        this.currentMapId = window.sourceMapId || '1';

        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);
        this.updateNewsContent = this.updateNewsContent.bind(this);
        this.transitionToNextMap = this.transitionToNextMap.bind(this);
        this.showNews = this.showNews.bind(this);
        this.hideNews = this.hideNews.bind(this);

        // 绑定updatePosition方法
        this.updatePosition = this.updatePosition.bind(this);
        // Initialize event listeners
        this.initEventListeners();

        this.frameEed = document.getElementById('frame-Eed');
        this.frameMap = document.getElementById('frame-map');
        this.frameNews = document.getElementById('frame-News');
        this.offsetY = 0;
        this.isNewsFrameVisible = false;
        this.currentMapId = window.sourceMapId || '1';

    }

    initEventListeners() {
        this.okButton?.addEventListener('click', this.showNews);
        this.container?.addEventListener('wheel', this.handleScroll, { passive: false });
        this.closeButton?.addEventListener('click', this.hideNews);
    }

    handleScroll(event) {
        if (!this.isNewsFrameVisible) return;
        const previousOffset = this.offsetY;

        if (event.deltaY > 0) {
            this.offsetY = Math.max(this.offsetY - 50, -3000);
        } else {
            this.offsetY = Math.min(this.offsetY + 50, -790);
        }
        this.updateFramesPosition();

        // 计算新闻页面的淡出效果
        const newsTransitionStart = -2400;  // 开始过渡的位置
        const newsTransitionEnd = -2700;    // 结束过渡的位置

        if (this.offsetY <= newsTransitionStart) {
            // 计算过渡进度
            const transitionProgress = Math.min(
                Math.abs((this.offsetY - newsTransitionStart) / (newsTransitionEnd - newsTransitionStart)),
                1
            );

            // 更新新闻框架的淡出效果
            if (this.frameNews) {
                this.frameNews.style.opacity = `${1 - transitionProgress}`;
            }

            // 更新地图的模糊效果
            if (this.frameMap) {
                const blurAmount = 8 * (1 - transitionProgress);
                const elementsToUpdate = this.frameMap.querySelectorAll(
                    '#progress-bar, .box, #click-box-container, #message-container'
                );

                elementsToUpdate.forEach(element => {
                    element.style.filter = `blur(${blurAmount}px)`;
                    element.style.transition = 'filter 0.3s ease';
                });

                // 当达到过渡结束点时才进行地图切换
                if (this.offsetY <= newsTransitionStart) {
                    this.mapTransitionTriggered = false;
                    if (this.currentMapId === '3') {
                        this.transitionToEed();
                    } else {
                        this.transitionToNextMap();
                    }
                }
            }
        }
        event.preventDefault();

    }
    // 辅助方法：更新放大镜内容
    updateMagnifierContent(mapId) {
        const magnifierContent = document.getElementById("magnifier-content");
        const nextPage = document.getElementById(`map${mapId}`);
        if (nextPage && magnifierContent) {
            const gifPath = nextPage.getAttribute('data-gif');
            magnifierContent.src = gifPath;
        }
    }

    hideNews() {
        this.isNewsFrameVisible = false;

        if (this.frameNews) {
            this.frameNews.classList.add('hidden');
            this.frameNews.style.display = 'none';
        }

        // 只有在不是 map3 时才清除模糊效果
        if (this.currentMapId !== '3') {
            this.unblurMap();
        }

        this.offsetY = 0;
        this.updateFramesPosition();
    }
    transitionToEed() {
        // 隐藏新闻框架
        this.hideNews();

        // 保持地图可见但模糊
        if (this.frameMap) {
            this.frameMap.style.display = 'block';
            const elementsToKeepBlur = this.frameMap.querySelectorAll(
                '#progress-bar, .box, #click-box-container, #message-container'
            );
            elementsToKeepBlur.forEach(element => {
                element.style.filter = 'blur(8px)';
            });
        }

        // 显示 Eed 框架
        this.frameEndComponent.show();
    }
    transitionToNextMap() {
        this.hideNews();

        // 先更新全局状态
        const nextMap = (parseInt(this.currentMapId) + 1).toString();
        this.currentMapId = nextMap;
        window.sourceMapId = nextMap;
        console.log('Transitioning to map:', nextMap);

        switch (this.currentMapId) {
            case '2':
                this.unblurMap();
                this.activateMap('2');
                this.reactivateMagnifier();
                this.resetLongPressCount('2');
                break;

            case '3':
                this.unblurMap();
                this.activateMap('3');
                this.reactivateMagnifier();
                this.resetLongPressCount('3');
                break;
        }
    }

    // 添加新方法
    resetLongPressCount(mapId) {
        // 重置计数
        window.longPressCounts = window.longPressCounts || { "1": 0, "2": 0, "3": 0 };
        window.longPressCounts[mapId] = 0;

        // 重新初始化点击事件
        const clickBoxes = document.querySelectorAll('.click-box');
        clickBoxes.forEach(clickBox => {
            if (clickBox.getAttribute('data-map') === mapId) {
                clickBox.style.display = 'block';
                this.bindClickBoxEvents(clickBox);
            } else {
                clickBox.style.display = 'none';
            }
        });
    }

    bindClickBoxEvents(clickBox) {
        // 移除旧的事件监听器（如果存在）
        clickBox.onmousedown = null;

        // 添加新的事件监听器
        clickBox.onmousedown = (e) => {
            this.startCreatingBox(e.pageX, e.pageY, clickBox);
        };
    }

    startCreatingBox(x, y, clickBox) {
        // 清除任何现有的定时器
        if (window.intervalId) {
            clearInterval(window.intervalId);
        }

        let currentIndex = 0;
        const messages = JSON.parse(clickBox.getAttribute('data-messages') || '["Default message"]');
        const mapId = clickBox.getAttribute('data-map');
        const longPressRequirements = { "1": 1, "2": 3, "3": 2 };

        window.intervalId = setInterval(() => {
            if (currentIndex < messages.length) {
                this.createDialogBox(x, y, messages[currentIndex], clickBox);
                currentIndex++;
            } else {
                clearInterval(window.intervalId);
                if (mapId) {
                    window.longPressCounts[mapId]++;

                    if (window.longPressCounts[mapId] >= longPressRequirements[mapId]) {
                        setTimeout(() => {
                            this.triggerBlurAndShowConsole(mapId, clickBox);
                        }, 500);
                    }
                }
            }
        }, 1500);

        // 添加全局鼠标释放事件监听器
        document.addEventListener('mouseup', () => {
            if (window.intervalId) {
                clearInterval(window.intervalId);
                window.intervalId = null;
            }
        }, { once: true });
    }
    createDialogBox(x, y, messageText, clickBox) {
        const messageContainer = document.getElementById('message-container');
        const boxRect = clickBox.getBoundingClientRect();
        const containerRect = messageContainer.getBoundingClientRect();
        const margin = 20;
        const offsetDistance = 110;

        let top, left;
        const spaceAbove = boxRect.top - containerRect.top;
        const spaceBelow = containerRect.bottom - boxRect.bottom;
        const spaceLeft = boxRect.left - containerRect.left;
        const spaceRight = containerRect.right - boxRect.right;
        // ... 定位逻辑保持不变 ...
        if (spaceAbove > spaceBelow && spaceAbove > spaceLeft && spaceAbove > spaceRight) {
            // Place above the click box if there's most space above
            top = boxRect.top - margin - 99;
            left = boxRect.left + (boxRect.width / 2) - 450;
        } else if (spaceBelow > spaceLeft && spaceBelow > spaceRight) {
            // Place below the click box if there's most space below
            top = boxRect.bottom + margin;
            left = boxRect.left + (boxRect.width / 2) - 450;
        } else if (spaceLeft > spaceRight) {
            // Place to the left if there's more space on the left
            top = boxRect.top + (boxRect.height / 2) - 49.5;
            left = boxRect.left - margin - 900;
        } else {
            // Place to the right as the default position
            top = boxRect.top + (boxRect.height / 2) - 49.5;
            left = boxRect.right + margin;
        }
        Array.from(messageContainer.children).forEach((child) => {
            let currentTop = parseInt(child.style.top) || y - 150;
            child.style.top = `${currentTop - offsetDistance}px`;
        });
        // 创建新对话框
        const newBox = document.createElement('div');
        newBox.classList.add('accordion-summary');
        newBox.textContent = messageText;
        newBox.style.left = `${left}px`;
        newBox.style.top = `${top}px`;
        messageContainer.appendChild(newBox);
        newBox.style.display = 'block';

        if (messageContainer.childElementCount > 4) {
            messageContainer.removeChild(messageContainer.firstChild);
        }
    }

    triggerBlurAndShowConsole(mapId, clickBox) {
        window.sourceMapId = mapId;

        // 模糊地图元素
        const elementsToBlur = this.frameMap.querySelectorAll(
            '#progress-bar, .box, #click-box-container, #message-container'
        );
        elementsToBlur.forEach(element => {
            element.style.filter = 'blur(8px)';
        });

        // 禁用放大镜
        const magnifier = document.getElementById('magnifier');
        const progressRingContainer = document.getElementById('progress-ring-container');
        if (magnifier) magnifier.style.display = 'none';
        if (progressRingContainer) progressRingContainer.style.display = 'none';

        // 显示控制台
        setTimeout(() => {
            if (this.frameConsole) {
                this.frameConsole.style.display = 'flex';
                this.frameConsole.style.opacity = '1';
                // 初始化控制台
                window.initConsole();
            }
        }, 500);
    }

    showClickBoxesForMap(mapId) {
        const clickBoxes = document.querySelectorAll('.click-box');
        clickBoxes.forEach(clickBox => {
            if (clickBox.getAttribute('data-map') === mapId) {
                clickBox.style.display = 'block';
                this.bindClickBoxEvents(clickBox);
            } else {
                clickBox.style.display = 'none';
                clickBox.onmousedown = null;
            }
        });
    }

    // 添加新方法
    reactivateMagnifier() {
        const frameMap = document.getElementById('frame-map');
        const magnifier = document.getElementById('magnifier');
        const progressRingContainer = document.getElementById('progress-ring-container');

        // 重新显示放大镜
        if (magnifier) magnifier.style.display = 'block';
        if (progressRingContainer) progressRingContainer.style.display = 'block';

        // 重新绑定鼠标移动事件
        if (frameMap) {
            // 先移除旧的事件监听器（如果存在）
            frameMap.removeEventListener("mousemove", this.updatePosition);
            // 添加新的事件监听器
            frameMap.addEventListener("mousemove", this.updatePosition);
        }
    }

    // 将updatePosition方法添加到类中
    updatePosition(e) {
        const magnifier = document.getElementById('magnifier');
        const magnifierContent = document.getElementById('magnifier-content');
        const progressRingContainer = document.getElementById('progress-ring-container');

        const containerRect = {
            width: 1920,
            height: 1080,
            left: 0,
            top: 0
        };
        const relativeX = (e.clientX - containerRect.left) / containerRect.width * 1920;
        const relativeY = (e.clientY - containerRect.top) / containerRect.height * 1080;

        // 保持放大镜的位置不变
        progressRingContainer.style.left = `${e.clientX}px`;
        progressRingContainer.style.top = `${e.clientY}px`;

        // 调整放大镜内部 GIF 图像的位置
        const offsetX = -60;
        const offsetY = -60;
        const scale = 1.3;
        magnifierContent.style.transform = `translate(-${relativeX * scale + offsetX}px, -${relativeY * scale + offsetY}px) scale(${scale})`;
    }

    unblurMap() {
        if (this.frameMap) {
            const elementsToUnblur = this.frameMap.querySelectorAll(
                '#progress-bar, .box, #click-box-container, #message-container'
            );
            elementsToUnblur.forEach(element => {
                element.style.filter = 'none';
            });

            // 恢复放大镜和进度环
            const magnifier = document.getElementById('magnifier');
            const progressRingContainer = document.getElementById('progress-ring-container');
            if (magnifier) {
                magnifier.style.display = 'block';
                magnifier.style.filter = 'none';
            }
            if (progressRingContainer) {
                progressRingContainer.style.display = 'block';
                progressRingContainer.style.filter = 'none';
            }

            // 重新绑定鼠标移动事件
            // this.reactivateMagnifier();
        }
    }

    activateMap(mapId) {
        this.currentMapId = mapId;
        window.sourceMapId = mapId;
        // Update circle and map visibility
        const circles = document.querySelectorAll("#progress-bar .circle");
        const maps = document.querySelectorAll(".box .page");

        circles.forEach(c => c.classList.remove("active-circle"));
        maps.forEach(m => m.classList.remove("open"));

        const index = parseInt(mapId) - 1;
        if (circles[index]) circles[index].classList.add("active-circle");
        if (maps[index]) maps[index].classList.add("open");

        // Update click boxes
        this.showClickBoxesForMap(mapId);

        // Update magnifier content
        const magnifierContent = document.getElementById("magnifier-content");
        const page = document.getElementById(`map${mapId}`);
        if (page && magnifierContent) {
            const gifPath = page.getAttribute('data-gif');
            magnifierContent.src = gifPath;
        }
    }

    showClickBoxesForMap(mapId) {
        const clickBoxes = document.querySelectorAll('.click-box');
        clickBoxes.forEach(clickBox => {
            if (clickBox.getAttribute('data-map') === mapId) {
                clickBox.style.display = 'block';
            } else {
                clickBox.style.display = 'none';
            }
        });
    }

    updateFramesPosition() {
        const transform = `translateY(${this.offsetY}px)`;
        if (this.newsFrame) this.newsFrame.style.transform = transform;
        if (this.commentsFrame) this.commentsFrame.style.transform = transform;
    }

    showNews() {
        const currentMapId = window.sourceMapId || '1';
        document.documentElement.style.setProperty('--gif-url', `url('image/frame-News/News_photo/map${currentMapId}/map${currentMapId}_news.gif')`);
        if (this.frameConsole) {
            this.frameConsole.style.display = 'none';
            this.frameConsole.style.opacity = '0';
        }

        // 显示新闻框架时添加过渡效果
        if (this.frameNews) {
            this.frameNews.style.transition = 'opacity 0.3s ease';
            this.frameNews.classList.remove('hidden');
            this.frameNews.style.display = 'flex';
            this.frameNews.style.opacity = '1';
            this.offsetY = -790;
            this.updateFramesPosition();
        }

        // 保持地图的模糊效果
        if (this.frameMap) {
            this.frameMap.style.display = 'block';
            const elementsToBlur = this.frameMap.querySelectorAll(
                '#progress-bar, .box, #click-box-container, #message-container'
            );
            elementsToBlur.forEach(element => {
                element.style.transition = 'filter 0.3s ease';
                element.style.filter = 'blur(8px)';
            });

            // 确保放大镜隐藏
            const magnifier = document.getElementById('magnifier');
            const progressRingContainer = document.getElementById('progress-ring-container');
            if (magnifier) magnifier.style.display = 'none';
            if (progressRingContainer) progressRingContainer.style.display = 'none';
        }

        this.isNewsFrameVisible = true;
    }

    hideNews() {
        this.isNewsFrameVisible = false;

        if (this.frameNews) {
            this.frameNews.classList.add('hidden');
            this.frameNews.style.display = 'none';
        }

        // 只有在不是 map3 时才清除模糊效果
        if (this.currentMapId !== '3') {
            this.unblurMap();
        }

        this.offsetY = 0;
        this.updateFramesPosition();
    }
    // 更新新闻内容的方法
    updateNewsContent(mapId, buttonType) {
        const imageMapping = {
            '1': {
                'government': 'image/frame-News/News_text/map1new-government3.svg',
                'enterprise': 'image/frame-News/News_text/map1new-enterprise3.svg',
                'public': 'image/frame-News/News_text/map1new-public3.svg',
                'objective': 'image/frame-News/News_text/map1new-objective3.svg'
            },
            '2': {
                'government': 'image/frame-News/News_text/map2new-government3.svg',
                'enterprise': 'image/frame-News/News_text/map2new-enterprise3.svg',
                'public': 'image/frame-News/News_text/map2new-public3.svg',
                'objective': 'image/frame-News/News_text/map2new-objective3.svg'
            },
            '3': {
                'government': 'image/frame-News/News_text/map3new-government3.svg',
                'enterprise': 'image/frame-News/News_text/map3new-enterprise3.svg',
                'public': 'image/frame-News/News_text/map3new-public3.svg',
                'objective': 'image/frame-News/News_text/map3new-objective3.svg'
            }
        };

        if (this.newsTextImage && imageMapping[mapId] && imageMapping[mapId][buttonType]) {
            this.newsTextImage.src = imageMapping[mapId][buttonType];
        }
    }
}

// 等待DOM加载完成后再创建实例
document.addEventListener('DOMContentLoaded', function () {
    // 初始化其他功能
    initConsole();


    // 创建NewsComponent实例
    const newsComponent = new NewsComponent();

    // 配置OK按钮事件
    const okButton = document.querySelector('.ok-button');
    if (okButton) {
        okButton.addEventListener('click', () => {
            const currentMapId = window.sourceMapId || '1';
            const activeButton = document.querySelector('.button.active');
            if (activeButton) {
                const buttonType = activeButton.dataset.type;
                newsComponent.updateNewsContent(currentMapId, buttonType);
                newsComponent.showNews();
            }
        });
    }
});

function updateNewsContentDirectly(mapId, buttonType) {
    const imageMapping = {
        '1': {
            'government': 'image/frame-News/News_text/map1new-government3.svg',
            'enterprise': 'image/frame-News/News_text/map1new-enterprise3.svg',
            'public': 'image/frame-News/News_text/map1new-public3.svg',
            'objective': 'image/frame-News/News_text/map1new-objective3.svg'
        },
        '2': {
            'government': 'image/frame-News/News_text/map2new-government3.svg',
            'enterprise': 'image/frame-News/News_text/map2new-enterprise3.svg',
            'public': 'image/frame-News/News_text/map2new-public3.svg',
            'objective': 'image/frame-News/News_text/map2new-objective3.svg'
        },
        '3': {
            'government': 'image/frame-News/News_text/map3new-government3.svg',
            'enterprise': 'image/frame-News/News_text/map3new-enterprise3.svg',
            'public': 'image/frame-News/News_text/map3new-public3.svg',
            'objective': 'image/frame-News/News_text/map3new-objective3.svg'
        }
    };

    const newsTextImage = document.getElementById('news-text-image');
    if (newsTextImage && imageMapping[mapId] && imageMapping[mapId][buttonType]) {
        newsTextImage.src = imageMapping[mapId][buttonType];
    }
}

//在长按计数满足要求时，应用模糊效果并显示控制台;建议在这里添加frame-console的显示
function triggerBlurAndShowConsole(mapId, clickBox) {
    return new Promise((resolve) => {
        const frameMap = document.getElementById('frame-map');
        const frameConsole = document.getElementById('frame-console');
        const clickBoxType = clickBox.id.split('-')[1].replace(/\d+/g, '');

        // Set proper mapId in global state
        window.sourceMapId = mapId;
        console.log('Setting sourceMapId to:', mapId);

        // Apply blur effects
        const elementsToBlur = frameMap.querySelectorAll(
            '#progress-bar, .box, #click-box-container, #message-container'
        );
        elementsToBlur.forEach(element => {
            element.style.filter = 'blur(8px)';
        });

        // Hide magnifier components
        const magnifier = document.getElementById('magnifier');
        const progressRingContainer = document.getElementById('progress-ring-container');
        if (magnifier) magnifier.style.display = 'none';
        if (progressRingContainer) progressRingContainer.style.display = 'none';

        // Show and initialize console
        if (frameConsole) {
            frameConsole.style.display = 'flex';
            frameConsole.style.opacity = '0';
            frameConsole.offsetHeight; // Force reflow
            frameConsole.style.opacity = '1';
            frameConsole.style.transition = 'opacity 0.3s ease-in-out';

            const originalInitConsole = window.initConsole;

            window.initConsole = function () {
                // Ensure mapId is properly set before initialization
                const mapId = parseInt(window.sourceMapId); // Get current mapId
                window.sourceMapId = mapId; // Update currentMap in scope
                currentMap = mapId;
                console.log('Reinitializing with mapId:', mapId);
                // Initialize console with correct map
                originalInitConsole();

                setTimeout(() => {
                    // Update displayed image with correct map ID
                    const displayedImage = document.getElementById('displayed-image');
                    if (displayedImage) {
                        const imagePath = `/image/frame-console/map${mapId}_text/map${mapId}-${clickBoxType}1.svg`;
                        console.log('Setting image path with mapId:', mapId, imagePath);
                        displayedImage.src = imagePath;
                    }

                    // Activate corresponding button
                    const buttons = document.querySelectorAll('.button-container .button');
                    const buttonMapping = {
                        'government': 0,
                        'enterprise': 1,
                        'public': 2,
                        'objective': 3
                    };

                    const buttonIndex = buttonMapping[clickBoxType];
                    if (buttonIndex !== undefined && buttons[buttonIndex]) {
                        buttons.forEach(btn => btn.classList.remove('active'));
                        buttons[buttonIndex].classList.add('active');

                        // Update content with correct mapId
                        updateNewsContentDirectly(mapId, clickBoxType);

                        // Update photo images
                        const images = {
                            top1: `image/frame-News/News_photo/map${mapId}/map${mapId}-ph-${clickBoxType}1.png`,
                            top2: `image/frame-News/News_photo/map${mapId}/map${mapId}-ph-${clickBoxType}2.png`,
                            bottom: `image/frame-News/News_photo/map${mapId}/map${mapId}-ph-${clickBoxType}3.png`
                        };

                        const topImages = document.querySelectorAll('.TodaysNews-right-top img');
                        if (topImages[0]) topImages[0].src = images.top1;
                        if (topImages[1]) topImages[1].src = images.top2;

                        const bottomImage = document.querySelector('.TodaysNews-right-bottom img');
                        if (bottomImage) bottomImage.src = images.bottom;
                    }
                }, 50);
            };

            // Initialize console
            setTimeout(() => {
                console.log('Initializing console with mapId:', mapId);
                window.initConsole();
                resolve();
            }, 100);
        }
    });
}
function initializeCommentState() {
    // 只在全局状态未初始化时设置
    if (!window.commentState) {
        window.commentState = {
            currentIndex: 0,
            firstCommentIndex: 1,
            commentsIndex: [2, 3]
        };
    }
}

function initConsole() {

    const mapId = parseInt(window.sourceMapId);
    console.log('Initializing console with sourceMapId:', window.sourceMapId);

    const buttons = document.querySelectorAll('.button-container .button');
    const displayedImage = document.getElementById('displayed-image');
    const sliderPoints = document.querySelectorAll('.slider-point');
    const sliderHandle = document.querySelector('.slider-handle');
    const sliderTrack = document.querySelector('.slider-track');

    let currentMap = mapId;  // 当前地图编号
    console.log('Setting current map:', currentMap);
    let currentButton = null;  // 当前选中的按钮类型
    let currentSliderPosition = 0;  // 当前滑块位置
    window.commentState = {
        firstCommentIndex: 1,     // 从3开始
        commentsIndex: [2, 3]     // 从4,5开始
    };

    // Get initial active button if exists
    const initialActiveButton = document.querySelector('.button.active');
    if (initialActiveButton) {
        const typeMapping = {
            0: 'government',
            1: 'enterprise',
            2: 'public',
            3: 'objective'
        };
        currentButton = typeMapping[Array.from(buttons).indexOf(initialActiveButton)];
        updateCommentImages(currentButton);
    } else {
        // 如果没有活动按钮，默认选择第一个按钮并更新评论
        buttons[0].classList.add('active');

    }
    moveSlider(0);

    // 按钮点击事件
    // 按钮点击事件处理
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const typeMapping = {
                0: 'government',
                1: 'enterprise',
                2: 'public',
                3: 'objective'
            };

            currentButton = typeMapping[index];
            updateDisplayedImage(); // 立即更新图片

         
            updateCommentImages(currentButton);
        });
    });


    // 更新frame-console的对应按钮图片
    function updateDisplayedImage() {
        if (!currentButton) {
            const activeButton = document.querySelector('.button.active');
            if (activeButton) {
                const typeMapping = {
                    0: 'government',
                    1: 'enterprise',
                    2: 'public',
                    3: 'objective'
                };
                currentButton = typeMapping[Array.from(buttons).indexOf(activeButton)];
            } else {
                buttons[0].click();
                return;
            }
        }

        if (displayedImage) {
            const imagePath = `/image/frame-console/map${currentMap}_text/map${currentMap}-${currentButton}${currentSliderPosition + 1}.svg`;
            console.log('Setting image path:', imagePath);
            displayedImage.src = imagePath;
        }
    }




    // plus-icon的点击逻辑
    // plus-icon的点击逻辑
    // plus-icon的点击逻辑
    const plusIcon = document.querySelector('.Comments-Title img[src*="plus-icon"]');
    if (plusIcon) {
        plusIcon.style.cursor = 'pointer';
        let clickCount = 0;
    
        // 定义评论序列
        const commentSequences = {
            top:    [1, 4, 2, 5, 3],      
            middle: [2, 5, 3, 1, 4],   
            bottom: [3, 1, 4, 2, 5]    
        };
    
        let currentCycle = 0;  // 控制序列循环
    
        // 初始化评论状态为最后一组状态：
        window.commentState = {
            firstCommentIndex: commentSequences.top[1],    
            commentsIndex: [
                commentSequences.middle[1],                
                commentSequences.bottom[1]                 
            ]
        };
    
        plusIcon.addEventListener('click', () => {
            const activeButton = document.querySelector('.button.active');
            if (!activeButton) return;
    
            const buttonType = activeButton.dataset.type;
            const position = clickCount % 3; // 0-上方, 1-中间, 2-下方
    
            // 根据点击位置更新对应的评论
            switch (position) {
                case 0: // 上方评论
                    window.commentState.firstCommentIndex = commentSequences.top[currentCycle];
                    break;
                case 1: // 中间评论
                    window.commentState.commentsIndex[0] = commentSequences.middle[currentCycle];
                    break;
                case 2: // 下方评论
                    window.commentState.commentsIndex[1] = commentSequences.bottom[currentCycle];
                    currentCycle = (currentCycle + 1) % 5;  // 在完成一组三次点击后更新循环
                    break;
            }
    
            // 更新图片显示
            updateCommentImages(buttonType);
            
            // 增加点击计数
            clickCount++;
        });
    }

    function updateCommentImages(buttonType) {
        console.log('Updating images with state:', window.commentState);
        const currentMap = window.sourceMapId || '1';
        const firstComment = document.querySelector('.First-Comment img');
        const comments = document.querySelectorAll('.Comments img');

        if (!firstComment) {
            console.error('First comment element not found');
            return;
        }

        if (currentMap > 1) {
            const firstCommentPath = `image/frame-News/comments_text/map${currentMap}_newstext/map${currentMap}-co-${buttonType}${window.commentState.firstCommentIndex}-1.png`;
            firstComment.src = firstCommentPath;

            firstComment.onmouseenter = () => {
                firstComment.src = firstCommentPath.replace('-1.png', '-2.png');
            };
            firstComment.onmouseleave = () => {
                firstComment.src = firstCommentPath;
            };
        } else {
            const firstCommentPath = `image/frame-News/comments_text/map${currentMap}_newstext/map${currentMap}-co-${buttonType}${window.commentState.firstCommentIndex}.png`;
            console.log('Setting first comment path:', firstCommentPath);
            firstComment.src = firstCommentPath;
        }

        comments.forEach((comment, index) => {
            const imageIndex = window.commentState.commentsIndex[index];
            if (currentMap > 1) {
                const commentPath = `image/frame-News/comments_text/map${currentMap}_newstext/map${currentMap}-co-${buttonType}${imageIndex}-1.png`;
                comment.src = commentPath;

                comment.onmouseenter = () => {
                    comment.src = commentPath.replace('-1.png', '-2.png');
                };
                comment.onmouseleave = () => {
                    comment.src = commentPath;
                };
            } else {
                const commentPath = `image/frame-News/comments_text/map${currentMap}_newstext/map${currentMap}-co-${buttonType}${imageIndex}.png`;
                console.log(`Setting comment ${index} path:`, commentPath);
                comment.src = commentPath;
            }
        });
    }





    const sliderContainer = document.querySelector('.slider-container');
    const positions = [0, 50, 100]; // 滑块在三个点上的位置百分比

    // 滑块点击事件
    sliderPoints.forEach((point, index) => {
        point.addEventListener('click', () => {
            moveSlider(index);
        });
    });

    // 点击滑块容器时移动滑块
    sliderContainer?.addEventListener('click', (e) => {
        handleSliderMove(e.clientX);
    });

    // 模拟拖动滑块
    sliderHandle?.addEventListener('mousedown', (e) => {
        const onMouseMove = (event) => {
            handleSliderMove(event.clientX);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function handleSliderMove(clientX) {
        const rect = sliderContainer.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const percentage = Math.min(Math.max(offsetX / rect.width * 100, 0), 100);
        let closest = 0;

        positions.forEach((pos, index) => {
            if (Math.abs(percentage - pos) < Math.abs(percentage - positions[closest])) {
                closest = index;
            }
        });

        moveSlider(closest);
    }

    function moveSlider(position) {
        currentSliderPosition = position;
        const percent = position * 50;

        if (sliderHandle) sliderHandle.style.left = `${percent}%`;
        if (sliderTrack) sliderTrack.style.width = `${percent}%`;

        sliderPoints.forEach((point, index) => {
            if (index <= position) {
                point.classList.add('active');
            } else {
                point.classList.remove('active');
            }
        });

        updateDisplayedImage(); // 更新图片显示
    }
}

document.addEventListener('DOMContentLoaded', function () {

    initConsole();
    const newsComponent = new NewsComponent();
    // 给 ok 按钮添加点击事件
    const okButton = document.querySelector('.ok-button');
    okButton?.addEventListener('click', () => {
        const currentMapId = window.sourceMapId || '1';
        const activeButton = document.querySelector('.button.active');
        if (activeButton) {
            const buttonType = activeButton.dataset.type;
            newsComponent.updateNewsContent(currentMapId, buttonType);
            newsComponent.showNews();
        }
    });

    const frame1 = document.getElementById('frame-1');
    const frame2 = document.getElementById('frame-2');
    const frameMap = document.getElementById('frame-map');
    const startButton = document.querySelector('.start-button');
    const circles = document.querySelectorAll("#progress-bar .circle");
    const maps = document.querySelectorAll(".box .page");

    const magnifier = document.getElementById("magnifier");
    const magnifierContent = document.getElementById("magnifier-content");
    const progressRingContainer = document.getElementById("progress-ring-container");
    const progressCircle = document.getElementById("progress-ring-circle");
    const ringBackground = document.getElementById('ring-background');
    const progressBlob = document.getElementById('progress-ring-blob');

    const messageContainer = document.getElementById('message-container');

    let intervalId;

    // 获取所有 click-box 和 map 页元素
    const clickBoxes = document.querySelectorAll('.click-box');
    clickBoxes.forEach(box => box.style.display = 'none');

    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    let animationFrame;
    let progressComplete = false;

    // 修改map需要点几个对话
    let longPressCounts = { "1": 0, "2": 0, "3": 0 };

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;

        if (percent >= 100) {
            progressComplete = true;
            progressCircle.classList.add('hide-regular');
            ringBackground.style.display = 'none';
            progressBlob.style.display = 'block';
        }
    }

    function resetProgress() {
        progressComplete = false;
        progressCircle.classList.remove('hide-regular');
        ringBackground.style.display = 'block';
        progressBlob.style.display = 'none';
        setProgress(0);
    }

    function updateMagnifierContent(mapId) {
        const page = document.getElementById(mapId);
        const gifPath = page.getAttribute('data-gif');
        magnifierContent.src = gifPath;
    }

    let hasTransitioned = false;

    function toggleFrameVisibility(fromFrame, toFrame) {
        fromFrame.classList.remove('active');
        fromFrame.classList.add('hidden');
        toFrame.classList.remove('hidden');
        toFrame.classList.add('active');
    }

    function switchToFrame2() {
        toggleFrameVisibility(frame1, frame2);
    }

    function switchToFrameMap() {
        const frame2 = document.getElementById('frame-2');
        const frameMap = document.getElementById('frame-map');
        const currentMapId = window.sourceMapId || '1';

        // 添加过渡效果
        frame2.style.transition = 'opacity 0.5s ease-in-out';
        frameMap.style.transition = 'opacity 0.5s ease-in-out, filter 0.5s ease-in-out';

        // 首先准备地图内容
        const circles = document.querySelectorAll("#progress-bar .circle");
        const maps = document.querySelectorAll(".box .page");
        const index = parseInt(currentMapId) - 1;

        // 预先设置正确的地图和圆圈
        circles.forEach(c => c.classList.remove("active-circle"));
        maps.forEach(m => {
            m.classList.remove("open");
            m.style.transition = 'opacity 0.5s ease-in-out';
            // 确保所有地图图片都是隐藏状态
            const mapImage = m.querySelector('img');
            if (mapImage) {
                mapImage.style.opacity = '0';
                mapImage.style.transition = 'opacity 0.5s ease-in-out';
            }
        });

        // 激活目标地图和圆圈
        if (circles[index]) circles[index].classList.add("active-circle");
        if (maps[index]) {
            maps[index].classList.add("open");
            // 确保目标地图的图片元素准备就绪
            const targetMapImage = maps[index].querySelector('img');
            if (targetMapImage) {
                targetMapImage.style.display = 'block';
                targetMapImage.style.opacity = '0';
            }
        }

        // 开始过渡动画
        frame2.style.opacity = '0';

        // 在frame2开始淡出的同时，准备frameMap
        frameMap.classList.remove('hidden');
        frameMap.classList.add('active');
        frameMap.style.opacity = '0';
        frameMap.style.filter = 'blur(8px)'; // 初始状态为模糊

        // 当frame2接近完全淡出时，开始显示frameMap
        setTimeout(() => {
            frame2.classList.remove('active');
            frame2.classList.add('hidden');

            // 逐渐显示frameMap及其内容
            frameMap.style.opacity = '1';

            // 显示目标地图的图片
            if (maps[index]) {
                const targetMapImage = maps[index].querySelector('img');
                if (targetMapImage) {
                    requestAnimationFrame(() => {
                        targetMapImage.style.opacity = '1';
                    });
                }
            }

            // 更新放大镜内容
            const magnifierContent = document.getElementById("magnifier-content");
            const page = document.getElementById(`map${currentMapId}`);
            if (page && magnifierContent) {
                const gifPath = page.getAttribute('data-gif');
                magnifierContent.src = gifPath;

                // 当放大镜内容加载完成后，清除模糊效果
                magnifierContent.onload = () => {
                    setTimeout(() => {
                        frameMap.style.filter = 'blur(0)';
                    }, 200);
                };
            }

            // 显示正确的click-boxes
            showClickBoxesForMap(currentMapId);
        }, 300);
    }
    const showFrame2 = () => {
        if (hasTransitioned) return;
        hasTransitioned = true;
        switchToFrame2();
    };

    setTimeout(showFrame2, 3000);
    frame1.addEventListener("click", showFrame2);
    startButton.addEventListener("click", switchToFrameMap);

    // 更新点击圆圈切换地图的处理程序
    function handleCircleClick(circle, index) {
        const mapId = (index + 1).toString();
        const maps = document.querySelectorAll(".box .page");

        // 先移除所有激活状态
        circles.forEach(c => c.classList.remove("active-circle"));
        maps.forEach(m => {
            m.classList.remove("open");
            const mapImage = m.querySelector('img');
            if (mapImage) {
                mapImage.style.opacity = '0';
                mapImage.style.transition = 'opacity 0.5s ease-in-out';
            }
        });

        // 然后添加新的激活状态
        circle.classList.add("active-circle");
        if (maps[index]) {
            maps[index].classList.add("open");
            const targetMapImage = maps[index].querySelector('img');
            if (targetMapImage) {
                targetMapImage.style.display = 'block';
                requestAnimationFrame(() => {
                    targetMapImage.style.opacity = '1';
                });
            }
        }

        // 更新放大镜内容，等待图片加载
        const magnifierContent = document.getElementById("magnifier-content");
        const page = document.getElementById(`map${mapId}`);
        if (page && magnifierContent) {
            const gifPath = page.getAttribute('data-gif');
            magnifierContent.src = gifPath;
        }

        // 更新click-boxes
        showClickBoxesForMap(mapId);
    }
    function updatePosition(e) {
        // 保持放大镜与鼠标移动的逻辑不变
        const containerRect = {
            width: 1920,
            height: 1080,
            left: 0,
            top: 0
        };
        const relativeX = (e.clientX - containerRect.left) / containerRect.width * 1920;
        const relativeY = (e.clientY - containerRect.top) / containerRect.height * 1080;

        // 保持放大镜的位置不变
        progressRingContainer.style.left = `${e.clientX}px`;
        progressRingContainer.style.top = `${e.clientY}px`;

        // 调整放大镜内部 GIF 图像的位置，向右下偏移
        const offsetX = -60; // 向右偏移 60 像素
        const offsetY = -60; // 向下偏移 60 像素
        const scale = 1.3;
        magnifierContent.style.transform = `translate(-${relativeX * scale + offsetX}px, -${relativeY * scale + offsetY}px) scale(${scale})`;
    }

    frameMap.addEventListener("mousemove", updatePosition);

    let pressing = false;
    let startTime;

    function toggleRingAndMagnifier(show) {
        magnifier.classList.toggle('active', show);
        progressRingContainer.classList.toggle('active', show);
        ringBackground.style.display = show ? 'block' : 'none';
    }

    frameMap.addEventListener('mousedown', () => {
        pressing = true;
        startTime = new Date().getTime();
        resetProgress();
        toggleRingAndMagnifier(true);
        requestAnimationFrame(updateProgress);
    });

    frameMap.addEventListener('mouseup', () => {
        pressing = false;
        progressBlob.style.display = 'none';
        toggleRingAndMagnifier(false);

        if (!progressComplete) {
            resetProgress();
        }
    });

    frameMap.addEventListener("mouseleave", () => {
        pressing = false;
        if (!progressComplete) resetProgress();
        toggleRingAndMagnifier(false);
    });

    // 禁止页面缩放的指令
    // window.addEventListener('wheel', (e) => {
    //     if (e.ctrlKey) e.preventDefault();
    // }, { passive: false });

    function updateProgress() {
        if (!pressing) return;

        const elapsed = new Date().getTime() - startTime;
        const progress = Math.min((elapsed / 1000) * 100, 100);
        setProgress(progress);

        if (progress < 100) {
            animationFrame = requestAnimationFrame(updateProgress);
        }
    }
    let lastClickedBox = null;
    // 方框出现 // 方框出现 // 方框出现 // 方框出现 // 方框出现 // 方框出现 // 方框出现
    // 按住某个 clickBox 元素时，每隔1.5秒生成一个新的对话框
    function startCreatingBox(x, y, clickBox) {
        clearInterval(intervalId);
        // 添加显示状态控制
        let isDisplaying = true;
        const messages = JSON.parse(clickBox.getAttribute('data-messages') || '["Default message"]');
        const mapId = clickBox.getAttribute('data-map');
        const longPressRequirements = { "1": 1, "2": 3, "3": 2 };
        lastClickedBox = clickBox;

        // 修改消息显示函数为非异步方式
        function displayMessage(message) {
            if (!isDisplaying) return false;

            const maxLength = 100;
            let remainingText = message;
            let messageQueue = [];

            // 预处理消息分段
            while (remainingText.length > 0) {
                let cutPoint = remainingText.length <= maxLength ?
                    remainingText.length :
                    Math.min(maxLength, remainingText.length);

                if (cutPoint < remainingText.length) {
                    const punctuations = [
                        remainingText.lastIndexOf('。', maxLength),
                        remainingText.lastIndexOf('，', maxLength),
                        remainingText.lastIndexOf('！', maxLength),
                        remainingText.lastIndexOf('？', maxLength),
                        remainingText.lastIndexOf('.', maxLength),
                        remainingText.lastIndexOf(',', maxLength),
                        remainingText.lastIndexOf(' ', maxLength)
                    ];
                    const lastPunctuation = Math.max(...punctuations);
                    if (lastPunctuation !== -1) {
                        cutPoint = lastPunctuation + 1;
                    }
                }

                messageQueue.push(remainingText.substring(0, cutPoint));
                remainingText = remainingText.substring(cutPoint);
            }

            let currentPartIndex = 0;

            // 使用setInterval来显示消息片段
            intervalId = setInterval(() => {
                if (!isDisplaying || currentPartIndex >= messageQueue.length) {
                    clearInterval(intervalId);
                    return;
                }

                createDialogBox(x, y, messageQueue[currentPartIndex], clickBox);
                currentPartIndex++;

                if (currentPartIndex >= messageQueue.length) {
                    clearInterval(intervalId);
                    // 检查是否需要显示下一条消息
                    setTimeout(() => {
                        if (isDisplaying) {
                            let nextMessageIndex = messages.indexOf(message) + 1;
                            if (nextMessageIndex < messages.length) {
                                displayMessage(messages[nextMessageIndex]);
                            } else {
                                // 所有消息显示完毕
                                if (mapId) {
                                    longPressCounts[mapId]++;
                                    if (longPressCounts[mapId] >= longPressRequirements[mapId]) {
                                        setTimeout(() => {
                                            triggerBlurAndShowConsole(mapId, lastClickedBox);
                                        }, 500);
                                    }
                                }
                            }
                        }
                    }, 300);
                }
            }, 1300);
        }

        // 开始显示第一条消息
        if (messages.length > 0) {
            displayMessage(messages[0]);
        }

        // 修改mouseup事件处理
        function handleMouseUp() {
            isDisplaying = false;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }

        // 添加事件监听
        document.addEventListener('mouseup', handleMouseUp, { once: true });
    }
    //根据 clickBox 的位置在页面上生成对话框，并确保对话框不会超出页面边界。
    function createDialogBox(x, y, messageText, clickBox) {
        const boxRect = clickBox.getBoundingClientRect();
        const containerRect = messageContainer.getBoundingClientRect();
        const margin = 20;
        const offsetDistance = 110;

        let top, left;
        const spaceAbove = boxRect.top - containerRect.top;
        const spaceBelow = containerRect.bottom - boxRect.bottom;
        const spaceLeft = boxRect.left - containerRect.left;
        const spaceRight = containerRect.right - boxRect.right;

        // 计算对话框位置
        if (spaceAbove > spaceBelow && spaceAbove > spaceLeft && spaceAbove > spaceRight) {
            top = boxRect.top - margin - 99;
            left = boxRect.left + (boxRect.width / 2) - 450;
        } else if (spaceBelow > spaceLeft && spaceBelow > spaceRight) {
            top = boxRect.bottom + margin;
            left = boxRect.left + (boxRect.width / 2) - 450;
        } else if (spaceLeft > spaceRight) {
            top = boxRect.top + (boxRect.height / 2) - 49.5;
            left = boxRect.left - margin - 900;
        } else {
            top = boxRect.top + (boxRect.height / 2) - 49.5;
            left = boxRect.right + margin;
        }

        // 向上移动现有的对话框
        Array.from(messageContainer.children).forEach((child) => {
            let currentTop = parseInt(child.style.top) || y - 150;
            child.style.top = `${currentTop - offsetDistance}px`;
        });

        // 创建新的对话框
        const newBox = document.createElement('div');
        newBox.classList.add('accordion-summary');

        // 如果文本超过100个字符，截取前100个字符（在标点符号处截断）
        const maxLength = 150;
        if (messageText.length > maxLength) {
            let cutPoint = maxLength;
            // 查找标点符号位置
            const punctuations = [
                messageText.lastIndexOf('。', maxLength),
                messageText.lastIndexOf('，', maxLength),
                messageText.lastIndexOf('！', maxLength),
                messageText.lastIndexOf('？', maxLength),
                messageText.lastIndexOf(' ', maxLength)
            ];

            // 找到最后的标点符号位置
            const lastPunctuation = Math.max(...punctuations);
            if (lastPunctuation !== -1) {
                cutPoint = lastPunctuation + 1;
            }

            // 截取文本
            newBox.textContent = messageText.substring(0, cutPoint);
            // 将剩余文本添加到messages数组的下一个位置
            const remainingText = messageText.substring(cutPoint);
            if (remainingText) {
                // 获取当前的messages数组
                const messages = JSON.parse(clickBox.getAttribute('data-messages'));
                const currentIndex = messages.indexOf(messageText);
                // 在当前消息后插入剩余文本
                messages.splice(currentIndex + 1, 0, remainingText);
                // 更新clickBox的data-messages属性
                clickBox.setAttribute('data-messages', JSON.stringify(messages));
            }
        } else {
            newBox.textContent = messageText;
        }

        newBox.style.left = `${left}px`;
        newBox.style.top = `${top}px`;
        messageContainer.appendChild(newBox);
        newBox.style.display = 'block';

        // 限制显示的对话框数量
        if (messageContainer.childElementCount > 4) {
            messageContainer.removeChild(messageContainer.firstChild);
        }
    }


    // 添加关闭按钮的事件监听器
    const closeIcon = document.querySelector('.close-icon');
    closeIcon.addEventListener('click', () => {
        const frameConsole = document.getElementById('frame-console');
        const frameMap = document.getElementById('frame-map');

        // 隐藏 console
        frameConsole.style.display = 'none';
        frameConsole.style.opacity = '0';

        // 恢复放大镜效果和清除模糊
        restoreMagnifier();

        // 切换到正确的地图页面
        const circles = document.querySelectorAll("#progress-bar .circle");
        const maps = document.querySelectorAll(".box .page");

        // 移除所有激活状态
        circles.forEach(c => c.classList.remove("active-circle"));
        maps.forEach(m => m.classList.remove("open"));

        // 激活对应的地图和圆圈
        const circleIndex = parseInt(sourceMapId) - 1;
        if (circleIndex >= 0 && circleIndex < circles.length) {
            circles[circleIndex].classList.add("active-circle");
            maps[circleIndex].classList.add("open");

            // 更新放大镜内容
            updateMagnifierContent(`map${sourceMapId}`);

            // 显示对应地图的 click-boxes
            showClickBoxesForMap(sourceMapId);
        }
    });

    function restoreMagnifier() {
        const frameMap = document.getElementById('frame-map');
        const magnifier = document.getElementById('magnifier');
        const progressRingContainer = document.getElementById('progress-ring-container');

        // 移除模糊效果
        const blurredElements = frameMap.querySelectorAll('#progress-bar, .box, #click-box-container, #message-container');
        blurredElements.forEach(element => {
            element.style.filter = 'none';
        });

        // 恢复放大镜和进度环
        if (magnifier) magnifier.style.display = 'block';
        if (progressRingContainer) progressRingContainer.style.display = 'block';

        // 重新添加mousemove事件监听器
        frameMap.addEventListener('mousemove', updatePosition);
    }
    //根据当前map切换对应的click-box
    function showClickBoxesForMap(mapId) {
        const clickBoxes = document.querySelectorAll('.click-box');
        clickBoxes.forEach(clickBox => {
            clickBox.style.transition = 'opacity 0.5s ease-in-out';

            if (clickBox.getAttribute('data-map') === mapId) {
                clickBox.style.opacity = '0';
                clickBox.style.display = 'block';

                // 延迟显示click-boxes以配合过渡效果
                setTimeout(() => {
                    clickBox.style.opacity = '1';
                }, 400);

                clickBox.onmousedown = (e) => {
                    startCreatingBox(e.pageX, e.pageY, clickBox);
                };
            } else {
                clickBox.style.opacity = '0';
                setTimeout(() => {
                    clickBox.style.display = 'none';
                    clickBox.onmousedown = null;
                }, 500);
            }
        });
    }

});