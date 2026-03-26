from __future__ import annotations

from random import choice
from typing import Any

JUNGLE_EVENTS: list[dict[str, Any]] = [
    {
        "id": "event_whip",
        "chapter": 1,
        "text": "前方一條在你胸口高度的長鞭猛力橫掃而出！",
        "required_action": "crouch",
        "time_limit": 10.0,
        "success_text": "你即時避開了長鞭的攻擊!",
        "fail_text": "你反應不及，長鞭正好抽在你的胸口與肩膀!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_ground_pit",
        "chapter": 1,
        "text": "前方地面突然塌陷，出現一個佈滿碎石塊的陷阱坑！",
        "required_action": "jump",
        "time_limit": 10.0,
        "success_text": "你即時跳過了這個陷阱坑!",
        "fail_text": "你整個人跌進陷阱坑內，撞得全身瘀青才爬上來!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_tree_fall",
        "chapter": 1,
        "text": "後方有棵樹朝你倒下！",
        "required_action": "run_forward",
        "time_limit": 10.0,
        "success_text": "你即時逃過被樹木壓到的危機!",
        "fail_text": "樹倒下時樹枝劃傷了你的後背!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_monkey_attack",
        "chapter": 1,
        "text": "有隻兇猛的猴子朝你的方向撲來！",
        "required_action": "push",
        "time_limit": 10.0,
        "success_text": "你即時把猴子推開而規避了牠的攻擊!",
        "fail_text": "猴子往你臉上揍了一拳!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_boulder",
        "chapter": 2,
        "text": "一根圓柱形的木頭開始在大木橋上朝你滾來！",
        "required_action": "jump",
        "time_limit": 10.0,
        "success_text": "木頭從你腳下呼嘯而過，只差一點就撞上你!",
        "fail_text": "木頭重重地撞上你，你踉蹌倒地後艱難起身!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_blow_dart",
        "chapter": 2,
        "text": "你眼前有個吹箭向你飛來!",
        "required_action": "crouch",
        "time_limit": 10.0,
        "success_text": "你即時蹲下躲過了吹箭!",
        "fail_text": "你的肩膀被吹箭射傷!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_splash",
        "chapter": 2,
        "text": "河面突然竄起一股猛烈水花直撲橋面！",
        "required_action": "run_forward",
        "time_limit": 10.0,
        "success_text": "你即時跑過了水花的衝擊!",
        "fail_text": "你被兇猛的水花沖倒在地!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_fish_attack",
        "chapter": 2,
        "text": "水中一隻大魚竄出朝你前方撲來！",
        "required_action": "push",
        "time_limit": 10.0,
        "success_text": "你即時把大魚推回了水中!",
        "fail_text": "你被大魚咬傷了手臂!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_cave_horizontal_pillar",
        "chapter": 3,
        "text": "一根巨大的石柱從上方向你揮來！",
        "required_action": "crouch",
        "time_limit": 10.0,
        "success_text": "石柱在你頭頂呼嘯掠過!",
        "fail_text": "石柱狠狠撞上你的頭，讓你痛得幾乎站不穩!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_cave_front_crush",
        "chapter": 3,
        "text": "一大片的石板掉在你的前方並朝你的方向傾倒!",
        "required_action": "push",
        "time_limit": 10.0,
        "success_text": "你即時阻止石板砸在你身上!",
        "fail_text": "整塊石門重重砸在你的腳上!",
        "effects": {"on_success": {"hp": 0, "score": 15}, "on_fail": {"hp": -1, "score": -10}},
    },
    {
        "id": "event_cave_chase_pit",
        "chapter": 3,
        "text": "前方裂開一道狹長縫隙！",
        "required_action": "jump",
        "time_limit": 8.0,
        "success_text": "你順利跨過縫隙!",
        "fail_text": "你踩到裂縫邊緣失足絆倒，但馬上起身!",
        "effects": {"on_success": {"hp": 0, "score": 10}, "on_fail": {"hp": -1, "score": -10}},
    },
]


def resolve_chapter(chapter_id: str | None) -> int:
    if not chapter_id:
        return 1

    if chapter_id.startswith("chapter-"):
        tail = chapter_id.split("chapter-", maxsplit=1)[-1]
        if tail.isdigit():
            return int(tail)

    if chapter_id.isdigit():
        return int(chapter_id)

    return 1


def pick_event(chapter: int) -> dict[str, Any]:
    candidates = [item for item in JUNGLE_EVENTS if int(item["chapter"]) == chapter]
    if not candidates:
        candidates = [item for item in JUNGLE_EVENTS if int(item["chapter"]) == 1]
    return dict(choice(candidates))
