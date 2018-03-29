import re


d_regex = re.compile(r'd="(.*)"')
path_regex = re.compile(
    r'([MlcZ])\s*' +
    r'(?:([-\d.]+)[\s,]*([-\d.]+)[\s,]*)?' * 3
)

svg_methods = {
    'M': [1, 0, 0, 0],
    'L': [0, 1, 0, 0],
    'C': [0, 0, 1, 0],
    'Z': [0, 0, 0, 1]
}

def absolutify(point, last):
    return_object = []

    for i in range(3):
        if point[i][0] is not None:
            return_object.append([
                int(point[i][0]) / 256 + last[0],
                int(point[i][1]) / 256 + last[1]
            ])

        else:
            return_object.append([None, None])

    return return_object


def parse_svg(svg_text):
    d_match = d_regex.search(svg_text)
    path_match = path_regex.finditer(d_match.group(1))

    output_svg = []
    last_point = [0, 0]

    for match_result in path_match:
        method = match_result.group(1)
        point_args = [
            [match_result.group(2), match_result.group(3)],
            [match_result.group(4), match_result.group(5)],
            [match_result.group(6), match_result.group(7)]
        ]

        point_args = absolutify(point_args, last_point)

        if method == 'c':
            last_point = point_args[2]

        else:
            last_point = point_args[0]

        method = svg_methods[method.upper()]

        output_svg.append([method] + point_args)

    return output_svg
