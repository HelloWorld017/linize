from train.dataset import read_dataset
from train.model import LinizeModel


def run(args):
    seq_size = args.seq_size
    batch_size = args.batch_size
