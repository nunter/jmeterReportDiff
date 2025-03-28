// PDF导出功能
function exportToPdf() {
    // 显示加载提示
    const loadingElement = document.createElement('div');
    loadingElement.id = 'pdf-loading';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.width = '100%';
    loadingElement.style.height = '100%';
    loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.zIndex = '9999';
    
    const loadingText = document.createElement('div');
    loadingText.textContent = '正在生成PDF，请稍候...';
    loadingText.style.color = 'white';
    loadingText.style.padding = '20px';
    loadingText.style.backgroundColor = '#1890ff';
    loadingText.style.borderRadius = '4px';
    
    loadingElement.appendChild(loadingText);
    document.body.appendChild(loadingElement);
    
    // 获取当前时间作为文件名的一部分
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    const filename = `性能测试对比报告_${timestamp}.pdf`;
    
    // 创建一个克隆的容器用于PDF导出，避免修改原始DOM
    const originalContainer = document.querySelector('.page-container');
    const clonedContainer = originalContainer.cloneNode(true);
    
    // 移除所有空文本节点和多余的空行
    const removeEmptyTextNodes = (node) => {
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        const nodesToRemove = [];
        while (walker.nextNode()) {
            const currentNode = walker.currentNode;
            if (currentNode.nodeType === 3) { // 文本节点
                if (currentNode.textContent.trim() === '') {
                    nodesToRemove.push(currentNode);
                }
            } else if (currentNode.nodeType === 1) { // 元素节点
                // 检查是否为<br>或只包含空白的段落
                if (currentNode.tagName === 'BR' || 
                    (currentNode.tagName === 'P' && currentNode.textContent.trim() === '')) {
                    nodesToRemove.push(currentNode);
                }
            }
        }
        
        // 批量移除节点
        nodesToRemove.forEach(node => node.parentNode.removeChild(node));
    };
    removeEmptyTextNodes(clonedContainer);
    
    // 移除克隆容器中的导出按钮
    const exportBtnContainer = clonedContainer.querySelector('div');
    if (exportBtnContainer) {
        const exportBtn = exportBtnContainer.querySelector('#exportPdfBtn');
        // 确保exportBtn存在且是exportBtnContainer的子节点
        if (exportBtn && exportBtn.parentNode === exportBtnContainer) {
            exportBtnContainer.removeChild(exportBtn);
        } else if (exportBtn) {
            // 如果按钮存在但不是直接子节点，使用更安全的方式移除
            exportBtn.remove();
        }
    }
    
    // 确保表格在PDF中完整显示的预处理
    const tableContainer = clonedContainer.querySelector('.table-container');
    if (tableContainer) {
        // 修改表格容器样式，使其铺满整个页面
        tableContainer.style.overflow = 'visible';
        tableContainer.style.width = '100%';
        tableContainer.style.margin = '0';
        tableContainer.style.padding = '0';
        tableContainer.style.display = 'block';
        
        // 确保表格宽度适合内容
        const table = tableContainer.querySelector('table');
        if (table) {
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.margin = '0';
            table.style.fontSize = '13px';
            table.style.borderSpacing = '0';
            table.style.lineHeight = '1.1';
            
            // 确保所有单元格内容可见
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.whiteSpace = 'normal';
                cell.style.wordBreak = 'break-word';
                cell.style.padding = '2px';
                cell.style.height = 'auto';
                cell.style.lineHeight = '1.1';
            });
            
            // 调整行高
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                row.style.height = '16px';
                row.style.lineHeight = '1.1';
            });
            
            // 调整表头样式
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                header.style.padding = '3px 2px';
                header.style.height = '16px';
            });
            
            // 调整标题行
            const headerRows = table.querySelectorAll('thead tr');
            if (headerRows.length >= 2) {
                const subHeaderRow = headerRows[1];
                const subHeaders = subHeaderRow.querySelectorAll('th');
                subHeaders.forEach(th => {
                    th.style.height = '16px';
                    th.style.padding = '2px 1px';
                });
            }
        }
    }
    
    // 设置PDF导出选项 - 优化页面尺寸和表格显示设置
    const options = {
        margin: [5, 5, 5, 5],  // 将页面边距设置为最小值
        filename: filename,
        image: { type: 'jpeg', quality: 1 },  // 最高图片质量
        html2canvas: { 
            scale: 2,  // 提高清晰度
            useCORS: true,
            logging: true,
            letterRendering: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            // 使用文档的实际尺寸
            width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
            height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
            windowWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
            windowHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
            removeContainer: true,
            backgroundColor: '#ffffff',
            onclone: function(clonedDoc) {
                const container = clonedDoc.querySelector('.page-container');
                if (container) {
                    // 调整容器样式使内容铺满页面
                    container.style.width = '100%';
                    container.style.maxWidth = 'none';
                    container.style.margin = '0';
                    container.style.padding = '2px';
                    container.style.boxSizing = 'border-box';
                }

                const tables = clonedDoc.getElementsByTagName('table');
                Array.from(tables).forEach(table => {
                    // 确保表格完整显示并铺满页面
                    table.style.width = '100%';
                    table.style.maxWidth = 'none';
                    table.style.tableLayout = 'fixed';
                    table.style.pageBreakInside = 'avoid';
                    table.style.borderCollapse = 'collapse';
                    table.style.borderSpacing = '0';
                    table.style.margin = '0';
                    table.style.fontSize = '13px';
                    table.style.lineHeight = '1.1';
                    
                    // 优化单元格显示
                    const cells = table.querySelectorAll('td, th');
                    cells.forEach(cell => {
                        cell.style.whiteSpace = 'normal';
                        cell.style.wordBreak = 'break-word';
                        cell.style.padding = '1px 2px';
                        cell.style.border = '1px solid #ddd';
                        cell.style.textAlign = 'center';
                        cell.style.height = 'auto';
                        cell.style.lineHeight = '1.1';
                    });
                    
                    // 调整行高
                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        row.style.height = '16px';
                        row.style.lineHeight = '1.1';
                    });
                    
                    // 调整第一列的单元格样式
                    const firstColCells = table.querySelectorAll('td:first-child');
                    firstColCells.forEach(cell => {
                        cell.style.textAlign = 'left';
                        cell.style.paddingLeft = '8px';
                    });
                    
                    // 调整表头样式，使其更明显
                    const headers = table.querySelectorAll('th');
                    headers.forEach(header => {
                        header.style.backgroundColor = '#f0f0f0';
                        header.style.fontWeight = 'bold';
                        header.style.padding = '2px';
                        header.style.height = '16px';
                        header.style.fontSize = '13px';
                    });
                    
                    // 调整标题行
                    const headerRows = table.querySelectorAll('thead tr');
                    if (headerRows.length >= 2) {
                        // 主标题行
                        const mainHeaderRow = headerRows[0];
                        const mainHeaders = mainHeaderRow.querySelectorAll('th');
                        mainHeaders.forEach(th => {
                            th.style.height = '16px';
                            th.style.padding = '2px 1px';
                        });
                        
                        // 子标题行
                        const subHeaderRow = headerRows[1];
                        const subHeaders = subHeaderRow.querySelectorAll('th');
                        subHeaders.forEach(th => {
                            th.style.height = '16px';
                            th.style.padding = '2px 1px';
                        });
                    }
                });
                
                // 调整标题样式
                const titles = clonedDoc.querySelectorAll('h1, h2, h3, h4, h5, h6');
                titles.forEach(title => {
                    title.style.marginBottom = '3px';
                    title.style.marginTop = '3px';
                    title.style.fontSize = '14px';
                    title.style.lineHeight = '1.2';
                });
                
                // 调整趋势标记的大小
                const trends = clonedDoc.querySelectorAll('.trend-up, .trend-down');
                trends.forEach(trend => {
                    if (trend.classList.contains('trend-up')) {
                        trend.innerHTML = trend.innerHTML.replace('▲', '<span style="font-size:9px;">▲</span>');
                    } else {
                        trend.innerHTML = trend.innerHTML.replace('▼', '<span style="font-size:9px;">▼</span>');
                    }
                });
            }
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4',  // 使用A4纸张尺寸
            orientation: 'landscape',  // 使用横向显示以获得更多水平空间
            compress: true,
            hotfixes: ["px_scaling"],
            precision: 16
        },
        pagebreak: { mode: ['css', 'legacy'], before: '.page-break', avoid: ['tr', 'td'] }
    };
    
    // 添加超时处理，防止无限等待
    let pdfTimeout;
    const timeoutDuration = 60000; // 60秒超时
    
    // 创建超时处理函数
    const handleTimeout = () => {
        console.error('PDF导出超时');
        // 移除加载提示
        if (document.body.contains(loadingElement)) {
            document.body.removeChild(loadingElement);
        }
        alert('PDF导出超时，请尝试以下解决方法：\n1. 刷新页面后重试\n2. 使用浏览器的打印功能（Ctrl+P或⌘+P）保存为PDF');
    };
    
    // 设置超时计时器
    pdfTimeout = setTimeout(handleTimeout, timeoutDuration);
    
    // 使用分步渲染方式导出PDF，减轻浏览器负担
    try {
        // 使用html2pdf库导出PDF
        html2pdf()
            .from(clonedContainer)
            .set(options)
            .toPdf() // 先转换为PDF对象
            .get('pdf')
            .then(pdf => {
                // PDF对象创建成功，继续保存
                return pdf.save(filename);
            })
            .then(() => {
                // 清除超时计时器
                clearTimeout(pdfTimeout);
                // 移除加载提示
                if (document.body.contains(loadingElement)) {
                    document.body.removeChild(loadingElement);
                }
                console.log(`PDF已保存: ${filename}`);
            })
            .catch(error => {
                // 清除超时计时器
                clearTimeout(pdfTimeout);
                console.error('PDF导出失败:', error);
                // 移除加载提示
                if (document.body.contains(loadingElement)) {
                    document.body.removeChild(loadingElement);
                }
                // 显示错误信息
                alert('PDF导出失败，请尝试以下解决方法：\n1. 刷新页面后重试\n2. 使用浏览器的打印功能（Ctrl+P或⌘+P）保存为PDF');
            });
    } catch (error) {
        // 清除超时计时器
        clearTimeout(pdfTimeout);
        console.error('PDF导出过程中发生异常:', error);
        // 移除加载提示
        if (document.body.contains(loadingElement)) {
            document.body.removeChild(loadingElement);
        }
        // 显示错误信息
        alert('PDF导出过程中发生异常，请尝试以下解决方法：\n1. 刷新页面后重试\n2. 使用浏览器的打印功能（Ctrl+P或⌘+P）保存为PDF');
    }
}

// 检查html2pdf库是否正确加载
function checkHtml2PdfLoaded() {
    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf库未正确加载，尝试重新加载');
        // 尝试重新加载html2pdf库
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
            console.log('html2pdf库已重新加载');
        };
        script.onerror = function() {
            console.error('html2pdf库加载失败');
            alert('PDF导出功能加载失败，请刷新页面后重试');
        };
        document.head.appendChild(script);
        return false;
    }
    return true;
}

// 当页面加载完成后，为导出按钮添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            // 检查html2pdf库是否已加载
            if (checkHtml2PdfLoaded()) {
                exportToPdf();
            }
        });
    }
});

// 添加全局错误处理，捕获未处理的异常
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    // 如果有PDF加载提示，移除它
    const loadingElement = document.getElementById('pdf-loading');
    if (loadingElement && document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
        alert('PDF导出过程中发生错误，请重试');
    }
});