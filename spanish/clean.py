from googletrans import Translator, constants
from pprint import pprint
from time import sleep

translator = Translator()
output = []

with open('words.txt') as f:
    lines = f.readlines()

words = lines[0].split(" ")
for x in range(10000):
	if x % 100 == 0:
		sleep(120)
	if x % 2 != 0:
		translation = translator.translate(words[x], src="es")
		output.append(f"['{translation.origin}', '{translation.text}'],")
		print(f"['{translation.origin}', '{translation.text}'],")

with open('words.js', 'w') as f:
	f.write("words = [\n")
	for line in output:
		f.write(line)
		f.write('\n')
	f.write("]")
