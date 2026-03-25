"""Flask 應用程式入口"""
from flask import Flask
from flask_cors import CORS

from app.config import get_config
from app.routes import events_bp, game_bp, llm_bp, story_bp, system_bp


def create_app():
    """創建並配置 Flask 應用"""
    app = Flask(__name__)
    config = get_config()
    
    # 配置 CORS
    CORS(app, resources={r"/api/*": {"origins": config.cors_origins}})
    
    # 註冊藍圖
    app.register_blueprint(system_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(llm_bp)
    app.register_blueprint(story_bp)

    return app


# 創建應用實例
app = create_app()


if __name__ == '__main__':
    debug = get_config().app_env == "development"
    app.run(host='0.0.0.0', port=8000, debug=debug)
