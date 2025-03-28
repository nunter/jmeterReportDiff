// 从performance_data.json加载数据
async function loadData() {
    try {
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        // 如果URL中包含data_file参数，则使用该文件，否则使用默认的performance_data.json
        const dataFile = urlParams.get('data_file') || 'performance_data.json';
        
        // 添加时间戳参数避免浏览器缓存
        const timestamp = new Date().getTime();
        const url = `${dataFile}?t=${timestamp}`;
        console.log(`Fetching data from: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            console.error(`Error loading ${url}, falling back to performance_data.json`);
            // 如果加载失败，回退到使用默认文件
            const fallbackUrl = `performance_data.json?t=${timestamp}`;
            const fallbackResponse = await fetch(fallbackUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!fallbackResponse.ok) {
                throw new Error(`HTTP error! Status: ${fallbackResponse.status}`);
            }
            
            const fallbackData = await fallbackResponse.json();
            console.log('Data loaded from fallback successfully:', fallbackData.length, 'records');
            return fallbackData;
        }
        
        const data = await response.json();
        console.log('Data loaded successfully:', data.length, 'records');
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// 格式化百分比
function formatPercentage(value) {
    if (value === null || isNaN(value)) return '-';
    const formattedValue = value.toFixed(2);
    return formattedValue;
}

// 添加趋势指示器
function addTrendIndicator(value, isPositiveBetter = false) {
    if (value === null || isNaN(value)) return '-';
    
    // 计算是否为正向改进
    const isPositive = (value > 0 && isPositiveBetter) || (value < 0 && !isPositiveBetter);
    
    // 箭头方向：根据isPositiveBetter和值的正负确定
    // 对于响应时间和错误数(isPositiveBetter=false)：正值显示向下箭头，负值显示向上箭头
    // 对于吞吐量(isPositiveBetter=true)：正值显示向上箭头，负值显示向下箭头
    let trend;
    if (isPositiveBetter) {
        // 吞吐量：增加(>0)是好事，显示向上箭头；减少(<0)是坏事，显示向下箭头
        trend = value > 0 ? 'up' : (value < 0 ? 'down' : '');
    } else {
        // 响应时间、错误数：增加(>0)是坏事，显示向下箭头；减少(<0)是好事，显示向上箭头
        trend = value > 0 ? 'down' : (value < 0 ? 'up' : '');
    }
    
    // 格式化值（去掉符号，因为会通过箭头方向表示）
    const formattedValue = Math.abs(value).toFixed(2);
    
    // 返回格式化后的显示内容
    return `<span class="${isPositive ? 'positive' : 'negative'} ${trend ? 'trend-' + trend : ''}">${formattedValue}%</span>`;
}

// 排序表格
function sortTable(column, order = 'asc') {
    const tbody = document.querySelector('#reportTable tbody');
    // 保存Total行
    const totalRow = document.querySelector('.total-row');
    if (totalRow) {
        tbody.removeChild(totalRow);
    }
    
    // 获取所有非Total行 - 确保Total行不参与排序
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
        // 确保不包含Total行（通过类名或第一个单元格内容判断）
        return !row.classList.contains('total-row') && 
               row.querySelector('td.interface-name')?.textContent !== 'Total';
    });
    
    rows.sort((a, b) => {
        let aVal = a.querySelector(`td[data-${column}]`)?.getAttribute(`data-${column}`);
        let bVal = b.querySelector(`td[data-${column}]`)?.getAttribute(`data-${column}`);
        
        aVal = aVal === '-' ? 0 : parseFloat(aVal);
        bVal = bVal === '-' ? 0 : parseFloat(bVal);
        
        if (order === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });
    
    // 清空表格
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    // 重新添加排序后的行
    rows.forEach(row => tbody.appendChild(row));
    
    // 如果存在Total行，始终添加到最后
    if (totalRow) {
        tbody.appendChild(totalRow);
    }
}

// 初始化表格
async function initializeTable() {
    const data = await loadData();
    const tbody = document.querySelector('#reportTable tbody');
    
    // 清空现有数据
    tbody.innerHTML = '';
    
    // 计算总计
    const total = {
        meanResTime_A: 0,
        meanResTime_B: 0,
        throughput_A: 0,
        throughput_B: 0,
        errorCount_A: 0,
        errorCount_B: 0
    };
    
    // 查找是否已有Total数据
    const totalData = data.find(item => item.Transaction === 'Total');
    
    // 添加数据行
    data.forEach(item => {
        // 跳过Total行，因为我们会在最后单独添加
        if (item.Transaction === 'Total') return;
        
        const row = document.createElement('tr');
        
        // 更新总计
        total.meanResTime_A += item.meanResTime_A;
        total.meanResTime_B += item.meanResTime_B;
        total.throughput_A += item.throughput_A;
        total.throughput_B += item.throughput_B;
        total.errorCount_A += item.errorCount_A;
        total.errorCount_B += item.errorCount_B;
        
        row.innerHTML = `
            <td class="interface-name">${item.Transaction}</td>
            <td data-meanResTime_A="${item.meanResTime_A}">${item.meanResTime_A.toFixed(2)}</td>
            <td data-meanResTime_B="${item.meanResTime_B}">${item.meanResTime_B.toFixed(2)}</td>
            <td data-meanResTime_pct="${item.meanResTime_pct}">${addTrendIndicator(item.meanResTime_pct, false)}</td>
            <td data-throughput_A="${item.throughput_A}">${item.throughput_A.toFixed(2)}</td>
            <td data-throughput_B="${item.throughput_B}">${item.throughput_B.toFixed(2)}</td>
            <td data-throughput_pct="${item.throughput_pct}">${addTrendIndicator(item.throughput_pct, true)}</td>
            <td data-errorCount_A="${item.errorCount_A}">${item.errorCount_A}</td>
            <td data-errorCount_B="${item.errorCount_B}">${item.errorCount_B}</td>
            <td data-error_pct="${item.error_pct}">${addTrendIndicator(item.error_pct, false)}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // 添加总计行
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    
    if (totalData) {
        // 如果数据中已包含Total行，直接使用该数据
        totalRow.innerHTML = `
            <td class="interface-name">Total</td>
            <td data-meanResTime_A="${totalData.meanResTime_A}">${totalData.meanResTime_A.toFixed(2)}</td>
            <td data-meanResTime_B="${totalData.meanResTime_B}">${totalData.meanResTime_B.toFixed(2)}</td>
            <td data-meanResTime_pct="${totalData.meanResTime_pct}">${addTrendIndicator(totalData.meanResTime_pct, false)}</td>
            <td data-throughput_A="${totalData.throughput_A}">${totalData.throughput_A.toFixed(2)}</td>
            <td data-throughput_B="${totalData.throughput_B}">${totalData.throughput_B.toFixed(2)}</td>
            <td data-throughput_pct="${totalData.throughput_pct}">${addTrendIndicator(totalData.throughput_pct, true)}</td>
            <td data-errorCount_A="${totalData.errorCount_A}">${totalData.errorCount_A}</td>
            <td data-errorCount_B="${totalData.errorCount_B}">${totalData.errorCount_B}</td>
            <td data-error_pct="${totalData.error_pct}">${addTrendIndicator(totalData.error_pct, false)}</td>
        `;
    } else {
        // 如果数据中没有Total行，计算总计
        const meanResTime_pct = ((total.meanResTime_B - total.meanResTime_A) / total.meanResTime_A) * 100;
        const throughput_pct = ((total.throughput_B - total.throughput_A) / total.throughput_A) * 100;
        const error_pct = ((total.errorCount_B - total.errorCount_A) / (total.errorCount_A || 1)) * 100;
        
        totalRow.innerHTML = `
            <td class="interface-name">Total</td>
            <td>${total.meanResTime_A.toFixed(2)}</td>
            <td>${total.meanResTime_B.toFixed(2)}</td>
            <td>${addTrendIndicator(meanResTime_pct, false)}</td>
            <td>${total.throughput_A.toFixed(2)}</td>
            <td>${total.throughput_B.toFixed(2)}</td>
            <td>${addTrendIndicator(throughput_pct, true)}</td>
            <td>${total.errorCount_A}</td>
            <td>${total.errorCount_B}</td>
            <td>${addTrendIndicator(error_pct, false)}</td>
        `;
    }
    
    tbody.appendChild(totalRow);
    
    // 添加排序事件监听器
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            const currentOrder = th.classList.contains('asc') ? 'desc' : 'asc';
            
            // 移除所有排序类
            document.querySelectorAll('th').forEach(header => {
                header.classList.remove('asc', 'desc');
            });
            
            // 添加新的排序类
            th.classList.add(currentOrder);
            
            // 排序表格
            sortTable(column, currentOrder);
        });
    });
}

// 格式化时间戳为日期时间字符串
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// 显示对比时间
function displayCompareTime() {
    const urlParams = new URLSearchParams(window.location.search);
    const timestamp = urlParams.get('t');
    if (timestamp) {
        const compareTimeElement = document.getElementById('compareTime');
        if (compareTimeElement) {
            compareTimeElement.textContent = `对比时间：${formatTimestamp(timestamp)}`;
        }
    }
}

// 在页面加载完成后显示对比时间和初始化表格
window.addEventListener('DOMContentLoaded', () => {
    displayCompareTime();
    initializeTable();
});