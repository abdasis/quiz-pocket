import psycopg2
import json
import time

def generate_option_explanation(question, opt, idx, answer_idx, main_exp):
    opt_clean = opt.strip()
    is_correct = (idx == answer_idx)
    
    if is_correct:
        return f"{opt_clean} adalah jawaban yang benar. {main_exp}"
    
    # Heuristik berbasis pola kata kunci dan konteks pilihan salah
    return f"{opt_clean} kurang tepat karena {opt_clean.lower()} memiliki konsep dan fungsi yang berbeda dalam konteks pertanyaan ini, bukan merupakan faktor penentu jawaban yang diminta."

def main():
    conn = psycopg2.connect('dbname=quiz_pocket host=/var/run/postgresql user=abdasis')
    conn.autocommit = True
    cur = conn.cursor()
    
    cur.execute("SELECT id, question, options, answer_index, explanation FROM questions ORDER BY id ASC;")
    rows = cur.fetchall()
    
    print(f"Total rows to process: {len(rows)}")
    
    updated_count = 0
    for r in rows:
        qid, q_text, opts_json, ans_idx, exp = r
        try:
            options = json.loads(opts_json)
        except Exception:
            continue
            
        opt_explanations = []
        for i, opt in enumerate(options):
            if i == ans_idx:
                opt_explanations.append(f"{opt} adalah jawaban yang benar. {exp}")
            else:
                # Custom contextual generator
                opt_lower = opt.lower()
                q_lower = q_text.lower()
                
                if "hak istimewa" in opt_lower:
                    explanation_text = "Hak istimewa (privilese) adalah keuntungan khusus yang hanya diberikan kepada pihak tertentu, bukan keharusan hukum yang wajib ditaati oleh semua pengguna jalan."
                elif "keinginan pribadi" in opt_lower:
                    explanation_text = "Keinginan pribadi adalah dorongan kehendak individu yang bersifat subjektif, bukan norma hukum atau aturan keselamatan berkendara."
                elif "kebutuhan sekunder" in opt_lower:
                    explanation_text = "Kebutuhan sekunder berkaitan dengan pemenuhan pelengkap taraf hidup manusia dalam ekonomi, bukan ketaatan pada hukum berlalu lintas."
                elif "stomata" in opt_lower:
                    explanation_text = "Stomata adalah pori-pori pada permukaan daun untuk pertukaran gas O2/CO2 dan penguapan air, bukan pigmen penyerap cahaya matahari."
                elif "xilem" in opt_lower:
                    explanation_text = "Xilem adalah pembuluh yang bertugas mengangkut air dan mineral dari akar ke daun."
                elif "floem" in opt_lower:
                    explanation_text = "Floem adalah pembuluh yang mengangkut hasil fotosintesis dari daun ke seluruh bagian tumbuhan."
                elif "karbon dioksida" in opt_lower and ("dihirup" in q_lower or "fotosintesis" not in q_lower):
                    explanation_text = "Karbon dioksida (CO2) adalah gas hasil pembuangan respirasi makhluk hidup, bukan gas utama yang diserap saat bernapas."
                elif "oksigen" in opt_lower and "fotosintesis" in q_lower and "bahan" in q_lower:
                    explanation_text = "Oksigen adalah produk/hasil samping fotosintesis, bukan bahan mentah yang diserap tumbuhan dari udara."
                elif "mitokondria" in opt_lower:
                    explanation_text = "Mitokondria berfungsi sebagai pusat respirasi seluler dan penghasil energi (ATP), bukan organel fotosintesis."
                elif "ribosom" in opt_lower:
                    explanation_text = "Ribosom berfungsi untuk sintesis protein dalam sel."
                elif "nukleus" in opt_lower:
                    explanation_text = "Nukleus adalah inti sel yang mengatur seluruh aktivitas dan materi genetik sel."
                else:
                    explanation_text = f"{opt} bukan jawaban yang tepat. Pilihan ini merujuk pada konsep yang berbeda dan tidak sesuai dengan konteks '{q_text[:45]}...'."
                
                opt_explanations.append(explanation_text)
                
        cur.execute(
            "UPDATE questions SET option_explanations = %s WHERE id = %s;",
            (json.dumps(opt_explanations), qid)
        )
        updated_count += 1
        
    print(f"Successfully populated option_explanations for {updated_count} questions!")

if __name__ == "__main__":
    main()
