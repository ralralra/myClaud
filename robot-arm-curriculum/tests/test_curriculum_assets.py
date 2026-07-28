"""로봇팔 12차시 교육자료 산출물 검증 (표준 라이브러리만 사용).

CI(pytest)가 수집·통과할 수 있도록, 그리고 자료가 깨지지 않았는지
확인하기 위한 가벼운 sanity 테스트다. python-docx 등 외부 의존성을
쓰지 않고, 파일 존재와 핵심 내용만 확인한다.
"""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _read(path):
    with open(os.path.join(BASE, path), encoding="utf-8") as f:
        return f.read()


def test_code_files_exist():
    for name in (
        "01_joystick_control.ino",
        "02_serial_record.ino",
        "03_functions_button.ino",
    ):
        assert os.path.isfile(os.path.join(BASE, "code", name)), name


def test_serial_sketch_adds_serial():
    src = _read("code/02_serial_record.ino")
    assert "Serial.begin" in src
    assert "printAngles" in src


def test_functions_sketch_has_functions_and_automation():
    src = _read("code/03_functions_button.ino")
    for token in ("void moveTo", "void goHome", "gripperOpen", "autoPickAndPlace"):
        assert token in src, token


def test_readme_covers_12_sessions():
    readme = _read("README.md")
    assert "12차시" in readme
    # 표에 1~12차시 행이 모두 있는지(간단 확인)
    for n in range(1, 13):
        assert f"| {n} |" in readme, f"{n}차시 행 누락"


def test_worksheet_final_pdf_is_valid():
    # 최종본 학습활동지(PDF)만 유지된다 — 존재 여부와 PDF 시그니처 확인
    path = os.path.join(BASE, "worksheets", "학습활동지_최종본.pdf")
    assert os.path.isfile(path)
    with open(path, "rb") as f:
        assert f.read(5).startswith(b"%PDF")
