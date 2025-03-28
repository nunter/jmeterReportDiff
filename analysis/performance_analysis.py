import json
import pandas as pd
from jinja2 import Template
from pathlib import Path
import time

def load_json_data(file_path):
    with open(file_path) as f:
        return json.load(f)

def extract_metrics(data):
    metrics = {}
    for transaction, values in data.items():
        metrics[transaction] = {
            'meanResTime': values['meanResTime'],
            'throughput': values['throughput'],
            'errorCount': values['errorCount']
        }
    return metrics

def calculate_comparison_metrics(metrics1, metrics2):
    comparison = []
    # 处理非Total的交易
    for trans in sorted([k for k in metrics1.keys() if k != 'Total']):
        if trans in metrics2:
            values1 = metrics1[trans]
            values2 = metrics2[trans]
            meanResTime_A = round(float(values1['meanResTime']), 2)
            meanResTime_B = round(float(values2['meanResTime']), 2)
            throughput_A = round(float(values1['throughput']), 2)
            throughput_B = round(float(values2['throughput']), 2)
            errorCount_A = values1['errorCount']
            errorCount_B = values2['errorCount']
            
            comparison.append({
                'Transaction': trans,
                'meanResTime_A': meanResTime_A,
                'meanResTime_B': meanResTime_B,
                'meanResTime_pct': round((meanResTime_B - meanResTime_A) / meanResTime_A * 100, 2) if meanResTime_A else 0,
                'throughput_A': throughput_A,
                'throughput_B': throughput_B,
                'throughput_pct': round((throughput_B - throughput_A) / throughput_A * 100, 2) if throughput_A else 0,
                'errorCount_A': errorCount_A,
                'errorCount_B': errorCount_B,
                'error_pct': round(((errorCount_B - errorCount_A) / (errorCount_A if errorCount_A != 0 else 1)) * 100, 2)
            })
    
    # 添加Total数据到最后
    if 'Total' in metrics1 and 'Total' in metrics2:
        values1 = metrics1['Total']
        values2 = metrics2['Total']
        meanResTime_A = round(float(values1['meanResTime']), 2)
        meanResTime_B = round(float(values2['meanResTime']), 2)
        throughput_A = round(float(values1['throughput']), 2)
        throughput_B = round(float(values2['throughput']), 2)
        errorCount_A = values1['errorCount']
        errorCount_B = values2['errorCount']
        
        comparison.append({
            'Transaction': 'Total',
            'meanResTime_A': meanResTime_A,
            'meanResTime_B': meanResTime_B,
            'meanResTime_pct': round((meanResTime_B - meanResTime_A) / meanResTime_A * 100, 2) if meanResTime_A else 0,
            'throughput_A': throughput_A,
            'throughput_B': throughput_B,
            'throughput_pct': round((throughput_B - throughput_A) / throughput_A * 100, 2) if throughput_A else 0,
            'errorCount_A': errorCount_A,
            'errorCount_B': errorCount_B,
            'error_pct': round(((errorCount_B - errorCount_A) / (errorCount_A if errorCount_A != 0 else 1)) * 100, 2)
        })
    
    return comparison

def generate_comparison_report(file1_path=None, file2_path=None, output_dir=None, output_filename='performance_data.json'):
    """
    生成性能对比报告
    :param file1_path: 上期报告路径，如果为None则使用默认路径
    :param file2_path: 本期报告路径，如果为None则使用默认路径
    :param output_dir: 输出目录路径，如果为None则使用默认路径
    :param output_filename: 输出文件名，默认为performance_data.json
    """
    # 文件路径配置
    base_dir = Path(__file__).parent.parent
    
    # if file1_path is None:
    #     file1_path = base_dir / 'statistics-202502211735.json'
    # if file2_path is None:
    #     file2_path = base_dir / 'statistics-202502281735.json'
    if output_dir is None:
        output_dir = base_dir / 'analysis'
        
    web_dir = Path(output_dir) / 'web_report'
    web_dir.mkdir(exist_ok=True)
    
    print(f"File 1 path: {file1_path}")
    print(f"File 2 path: {file2_path}")
    print(f"Output directory: {output_dir}")
    print(f"Web directory: {web_dir}")

    # 加载数据
    data1 = load_json_data(file1_path)
    data2 = load_json_data(file2_path)

    # 提取并计算对比指标
    metrics1 = extract_metrics(data1)
    metrics2 = extract_metrics(data2)
    comparison_data = calculate_comparison_metrics(metrics1, metrics2)
    
    # 创建对比表格
    comparison_df = pd.DataFrame(comparison_data)
    
    # 保存JSON
    performance_data_path = web_dir/output_filename
    # 保存原始performance_data.json作为链接
    link_file = web_dir/'performance_data.json'
    if link_file.exists():
        link_file.unlink()
    
    print(f"Saving performance data to: {performance_data_path}")
    comparison_df.to_json(performance_data_path, orient='records', indent=2)
    
    # 创建一个软链接或复制文件
    # 在windows下可能无法创建软链接，所以这里使用复制
    with open(performance_data_path, 'r') as f:
        data = f.read()
    with open(link_file, 'w') as f:
        f.write(data)
    
    return link_file

if __name__ == '__main__':
    generate_comparison_report()