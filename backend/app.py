"""Flask 應用程式入口"""
from flask import Flask
from flask_cors import CORS

from app.config import get_config
from app.routes import system, game, events, story


def create_app():
    """創建並配置 Flask 應用"""
    app = Flask(__name__)
    config = get_config()
    
    # 配置 CORS
    CORS(app, resources={r"/api/*": {"origins": config.cors_origins}})
    
    # 註冊藍圖
    app.register_blueprint(system.bp)
    app.register_blueprint(game.bp)
    app.register_blueprint(events.bp)
    app.register_blueprint(story.bp)

    return app


# 創建應用實例
app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
