from flask import Flask, request, send_from_directory, jsonify
import os
import json
import sys
import traceback
from pathlib import Path
import time

# 添加父目录到系统路径以导入performance_analysis
current_dir = Path(__file__).parent
sys.path.append(str(current_dir.parent))
from performance_analysis import generate_comparison_report

app = Flask(__name__)
app.debug = True

# 配置上传文件存储目录
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 静态文件目录配置
STATIC_FOLDER = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    return send_from_directory(STATIC_FOLDER, 'upload.html')

@app.route('/result.html')
def result():
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route('/script.js')
def script():
    return send_from_directory(STATIC_FOLDER, 'script.js')

@app.route('/pdf-export.js')
def pdf_export():
    return send_from_directory(STATIC_FOLDER, 'pdf-export.js')

@app.route('/print-fallback.js')
def print_fallback():
    return send_from_directory(STATIC_FOLDER, 'print-fallback.js')

@app.route('/performance_data.json')
def get_performance_data():
    # 添加缓存控制头，确保每次都获取最新的数据
    response = send_from_directory(STATIC_FOLDER, 'performance_data.json')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/performance_data_<timestamp>.json')
def get_timestamped_performance_data(timestamp):
    # 处理带时间戳的性能数据文件请求
    filename = f'performance_data_{timestamp}.json'
    app.logger.info(f'Requested timestamped performance data: {filename}')
    
    # 首先在当前目录查找文件
    if os.path.exists(os.path.join(STATIC_FOLDER, filename)):
        app.logger.info(f'Found file in current directory: {filename}')
        response = send_from_directory(STATIC_FOLDER, filename)
    # 如果当前目录没有，则在web_report子目录查找
    elif os.path.exists(os.path.join(STATIC_FOLDER, 'web_report', filename)):
        app.logger.info(f'Found file in web_report subdirectory: {filename}')
        response = send_from_directory(os.path.join(STATIC_FOLDER, 'web_report'), filename)
    else:
        app.logger.error(f'File not found in any directory: {filename}')
        return jsonify({'error': f'File {filename} not found'}), 404
    
    # 添加缓存控制头，确保每次都获取最新的数据
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/compare', methods=['POST'])
def compare():
    if 'file1' not in request.files or 'file2' not in request.files:
        app.logger.error('Missing files in request')
        return jsonify({'error': '请上传两个文件'}), 400
    
    file1 = request.files['file1']
    file2 = request.files['file2']
    
    if file1.filename == '' or file2.filename == '':
        app.logger.error('Empty filenames')
        return jsonify({'error': '文件名不能为空'}), 400
    
    file1_path = None
    file2_path = None
    
    try:
        # 保存上传的文件，添加时间戳避免覆盖
        timestamp = int(time.time())
        file1_path = os.path.join(UPLOAD_FOLDER, f'report1_{timestamp}.json')
        file2_path = os.path.join(UPLOAD_FOLDER, f'report2_{timestamp}.json')
        
        app.logger.info(f'Saving files to {file1_path} and {file2_path}')
        file1.save(file1_path)
        file2.save(file2_path)
        
        # 使用performance_analysis生成报告
        current_dir = Path(__file__).parent
        app.logger.info(f'Current directory for report generation: {current_dir}')
        
        # 使用时间戳创建唯一的输出文件名
        output_filename = f'performance_data_{timestamp}.json'
        output_path = current_dir / output_filename
        
        performance_data_path = generate_comparison_report(
            file1_path=file1_path,
            file2_path=file2_path,
            output_dir=current_dir,
            output_filename=output_filename
        )
        app.logger.info(f'Report generated at {performance_data_path}')
        
        # 添加调试信息
        try:
            with open(performance_data_path, "r") as f:
                content = f.read()[:200]
                app.logger.info(f"Performance data content (first 200 chars): {content}...")
                app.logger.info(f"Performance data file size: {os.path.getsize(performance_data_path)} bytes")
        except Exception as e:
            app.logger.error(f"Error reading performance data: {str(e)}")
        
        # 返回成功响应，使用时间戳参数避免浏览器缓存结果页面
        timestamp = int(time.time())
        return jsonify({'success': True, 'redirect': f'result.html?t={timestamp}&data_file=performance_data_{timestamp}.json'})
    
    except Exception as e:
        app.logger.error(f'Error during comparison: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    
    finally:
        # 清理上传的文件
        try:
            if file1_path and os.path.exists(file1_path):
                pass  # os.remove(file1_path)
            if file2_path and os.path.exists(file2_path):
                pass  # os.remove(file2_path)
        except Exception as e:
            app.logger.error(f'Error cleaning up files: {str(e)}')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)