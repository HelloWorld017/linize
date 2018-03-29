from train.parser import parse_svg
from os import path

import cv2
import numpy as np
import os


dataset_path = path.realpath(
    path.join(path.dirname(__file__), "..", "..", "results/dataset")
)
dataset_names = os.listdir(dataset_path)
datasets = {}

for dataset_name in dataset_names:
    dataset_class, dataset_type = dataset_name.split('_')

    if dataset_class not in datasets:
        datasets[dataset_class] = {}

    datasets[dataset_class][dataset_type] = os.listdir(path.join(dataset_path, dataset_name))


def read_dataset(dataset_class="train", start=0, count=1000):
    dataset = {}

    for (dataset_type, dataset_content) in datasets[dataset_class].items():
        dataset[dataset_type] = []
        dataset_name = "%s_%s" % (dataset_class, dataset_type)

        for i in range(start, start + count):
            data_path = path.join(dataset_path, dataset_name, dataset_content[i])

            if dataset_type == 'x':
                dataset[dataset_type].append(
                    np.array(cv2.imread(data_path)).astype('float32') / 255
                )

            elif dataset_type == 'y':
                f = open(data_path, 'r')

                dataset[dataset_type].append(
                    parse_svg(f.read())
                )

                f.close()


    return dataset
