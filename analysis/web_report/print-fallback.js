// 备用的PDF导出功能 - 使用浏览器原生打印功能
function printAsPdf() {
    // 创建一个新的打印样式表
    const style = document.createElement('style');
    style.id = 'print-style';
    style.textContent = `
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .page-container {
                width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                box-shadow: none !important;
            }
            #exportPdfBtn {
                display: none !important;
            }
            table {
                width: 100% !important;
                page-break-inside: avoid;
                border-collapse: collapse;
            }
            th, td {
                padding: 5px !important;
                font-size: 12px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 触发打印对话框
    window.print();
    
    // 打印完成后移除打印样式
    setTimeout(() => {
        const printStyle = document.getElementById('print-style');
        if (printStyle) {
            document.head.removeChild(printStyle);
        }
    }, 1000);
}

// 当页面加载完成后，为导出按钮添加右键菜单事件
document.addEventListener('DOMContentLoaded', function() {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        // 添加右键菜单事件
        exportPdfBtn.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            
            // 创建右键菜单
            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.style.position = 'absolute';
            menu.style.top = `${event.pageY}px`;
            menu.style.left = `${event.pageX}px`;
            menu.style.backgroundColor = 'white';
            menu.style.border = '1px solid #ccc';
            menu.style.borderRadius = '4px';
            menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            menu.style.padding = '5px 0';
            menu.style.zIndex = '1000';
            
            // 添加菜单项
            const menuItem = document.createElement('div');
            menuItem.textContent = '使用浏览器打印功能';
            menuItem.style.padding = '8px 12px';
            menuItem.style.cursor = 'pointer';
            menuItem.style.fontSize = '14px';
            menuItem.style.color = '#333';
            
            menuItem.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f5f5f5';
            });
            
            menuItem.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
            
            menuItem.addEventListener('click', function() {
                document.body.removeChild(menu);
                printAsPdf();
            });
            
            menu.appendChild(menuItem);
            document.body.appendChild(menu);
            
            // 点击其他区域关闭菜单
            document.addEventListener('click', function closeMenu() {
                if (document.body.contains(menu)) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        });
        
        // 添加提示信息
        exportPdfBtn.title = '左键点击：使用html2pdf导出 | 右键点击：显示更多选项';
    }
});